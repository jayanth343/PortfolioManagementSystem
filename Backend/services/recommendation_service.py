import logging
from typing import List, Dict, Optional
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from .stock_service import StockService, sanitize_value

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Service for generating portfolio recommendations using:
    - News sentiment analysis (FinBERT)
    - Analyst recommendations
    - Price performance
    """
    
    # Initialize FinBERT model (lazy loading)
    _finbert_model = None
    _finbert_tokenizer = None
    
    @classmethod
    def _get_finbert_model(cls):
        """Lazy load FinBERT model"""
        if cls._finbert_model is None:
            try:
                logger.info("Loading FinBERT model...")
                cls._finbert_tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
                cls._finbert_model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
                logger.info("FinBERT model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading FinBERT model: {e}")
                raise
        return cls._finbert_model, cls._finbert_tokenizer
    
    @staticmethod
    def analyze_sentiment(text: str) -> Dict:
        """
        Analyze sentiment of text using FinBERT
        Returns: {'sentiment': 'positive/negative/neutral', 'score': float}
        """
        try:
            model, tokenizer = RecommendationService._get_finbert_model()
            
            # Tokenize and get predictions
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Get sentiment label and confidence
            sentiment_idx = predictions.argmax().item()
            sentiment_score = predictions[0][sentiment_idx].item()
            
            sentiment_map = {0: 'positive', 1: 'negative', 2: 'neutral'}
            sentiment = sentiment_map.get(sentiment_idx, 'neutral')
            
            return {
                'sentiment': sentiment,
                'score': round(sentiment_score, 4)
            }
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {'sentiment': 'neutral', 'score': 0.0}
    
    @staticmethod
    def get_news_sentiment(ticker: str) -> Dict:
        """
        Get aggregated news sentiment for a ticker
        Returns average sentiment and individual news sentiments
        """
        try:
            news = StockService.format_news(yf.Ticker(ticker).get_news(count=20, tab='all'))
            formatted_news = StockService.format_news(news)   

            if not formatted_news:
                return {'average_sentiment': 'neutral', 'sentiment_score': 0.0, 'news_count': 0}
            
            sentiments = []
            for article in formatted_news:
                content = article.get('content', {})
                title = content.get('title', '')
                summary = content.get('summary', '')
                
                # Combine title and summary for analysis
                text = f"{title}. {summary}" if summary else title
                
                if text:
                    sentiment_result = RecommendationService.analyze_sentiment(text)
                    sentiments.append(sentiment_result)
            
            if not sentiments:
                return {'average_sentiment': 'neutral', 'sentiment_score': 0.0, 'news_count': 0}
            
            # Calculate weighted average sentiment score
            # positive = +1, neutral = 0, negative = -1
            sentiment_values = []
            for s in sentiments:
                if s['sentiment'] == 'positive':
                    sentiment_values.append(s['score'])
                elif s['sentiment'] == 'negative':
                    sentiment_values.append(-s['score'])
                else:
                    sentiment_values.append(0)
            
            avg_score = sum(sentiment_values) / len(sentiment_values)
            
            # Determine overall sentiment
            if avg_score > 0.2:
                overall_sentiment = 'positive'
            elif avg_score < -0.2:
                overall_sentiment = 'negative'
            else:
                overall_sentiment = 'neutral'
            
            return {
                'average_sentiment': overall_sentiment,
                'sentiment_score': round(avg_score, 4),
                'news_count': len(sentiments)
            }
            
        except Exception as e:
            logger.error(f"Error getting news sentiment for {ticker}: {e}")
            return {'average_sentiment': 'neutral', 'sentiment_score': 0.0, 'news_count': 0}
    
    @staticmethod
    def get_analyst_recommendation(ticker: str) -> Dict:
        """
        Get analyst recommendations summary
        Returns aggregated buy/hold/sell ratings
        """
        try:
            stock = yf.Ticker(ticker)
            rec_summary = stock.get_recommendations_summary()
            
            if rec_summary is None or rec_summary.empty:
                return {'recommendation': 'hold', 'confidence': 0.0}
            
            # Get latest recommendations (current period - 0m)
            latest = rec_summary.iloc[0]
            
            strong_buy = latest.get('strongBuy', 0)
            buy = latest.get('buy', 0)
            hold = latest.get('hold', 0)
            sell = latest.get('sell', 0)
            strong_sell = latest.get('strongSell', 0)
            
            total = strong_buy + buy + hold + sell + strong_sell
            
            if total == 0:
                return {'recommendation': 'hold', 'confidence': 0.0}
            
            # Calculate weighted score: strongBuy=+2, buy=+1, hold=0, sell=-1, strongSell=-2
            weighted_score = (strong_buy * 2 + buy * 1 + sell * -1 + strong_sell * -2) / total
            
            # Determine recommendation based on weighted score
            if weighted_score > 0.5:
                recommendation = 'strong_buy'
            elif weighted_score > 0.0:
                recommendation = 'buy'
            elif weighted_score < -0.5:
                recommendation = 'strong_sell'
            elif weighted_score < 0.0:
                recommendation = 'sell'
            else:
                recommendation = 'hold'
            
            confidence = abs(weighted_score) / 2  # Normalize to 0-1
            
            return {
                'recommendation': recommendation,
                'confidence': round(confidence, 4),
                'strong_buy': strong_buy,
                'buy': buy,
                'hold': hold,
                'sell': sell,
                'strong_sell': strong_sell
            }
            
        except Exception as e:
            logger.error(f"Error getting analyst recommendation for {ticker}: {e}")
            return {'recommendation': 'hold', 'confidence': 0.0}
    
    @staticmethod
    def analyze_holding(holding: Dict, in_portfolio: bool = True) -> Optional[Dict]:
        """
        Comprehensive analysis of a stock:
        - If in_portfolio=True: Analyzes performance vs buy price + sentiment + analyst recommendations
        - If in_portfolio=False: Analyzes only sentiment + analyst recommendations (for new investments)
        """
        ticker = holding.get('ticker', '').strip().upper()
        buy_price = holding.get('buyPrice')
        
        if not ticker:
            logger.warning(f"Invalid ticker: {holding}")
            return None
        
        if in_portfolio and (buy_price is None or buy_price <= 0):
            logger.warning(f"Buy price required for portfolio holdings: {holding}")
            return None
        
        try:
            stock = yf.Ticker(ticker)
            history = stock.history(period="1d")
            
            if history.empty:
                logger.warning(f"No price data for {ticker}")
                return None
            
            current_price = float(history['Close'].iloc[-1])
            info = stock.info
            
            # Get news sentiment
            news_sentiment = RecommendationService.get_news_sentiment(ticker)
            
            # Get analyst recommendations
            analyst_rec = RecommendationService.get_analyst_recommendation(ticker)
            
            # Convert analyst recommendation to score
            rec_map = {
                'strong_buy': 1.0,
                'buy': 0.5,
                'hold': 0.0,
                'sell': -0.5,
                'strong_sell': -1.0
            }
            analyst_score = rec_map.get(analyst_rec['recommendation'], 0.0)
            sentiment_score = news_sentiment['sentiment_score']
            
            result = {
                'symbol': ticker,
                'name': info.get('longName', info.get('shortName', ticker)),
                'currentPrice': round(current_price, 2),
                'newsSentiment': news_sentiment['average_sentiment'],
                'sentimentScore': news_sentiment['sentiment_score'],
                'analystRecommendation': analyst_rec['recommendation'],
                'analystConfidence': analyst_rec['confidence'],
                'inPortfolio': in_portfolio
            }
            
            if in_portfolio:
                # Calculate performance for existing holdings
                gain_loss = current_price - buy_price
                gain_loss_percent = (gain_loss / buy_price) * 100 if buy_price > 0 else 0
                performance_score = max(min(gain_loss_percent / 50, 1), -1)  # Normalize to -1 to 1
                
                # Weighted composite score: performance (30%), sentiment (35%), analyst (35%)
                composite_score = (
                    performance_score * 0.30 +
                    sentiment_score * 0.35 +
                    analyst_score * 0.35
                )
                
                # Determine action for existing holdings
                if composite_score > 0.4:
                    action = 'STRONG BUY'  # Add to position
                elif composite_score > 0.1:
                    action = 'BUY'  # Add to position
                elif composite_score < -0.4:
                    action = 'STRONG SELL'  # Exit position
                elif composite_score < -0.1:
                    action = 'SELL'  # Reduce position
                else:
                    action = 'HOLD'  # Maintain position
                
                result.update({
                    'buyPrice': round(buy_price, 2),
                    'gainLoss': round(gain_loss, 2),
                    'gainLossPercent': round(gain_loss_percent, 2),
                    'compositeScore': round(composite_score, 4),
                    'action': action,
                    'reasoning': RecommendationService._generate_reasoning(
                        gain_loss_percent, 
                        news_sentiment['average_sentiment'],
                        analyst_rec['recommendation'],
                        in_portfolio
                    )
                })
            else:
                # For stocks not in portfolio: only sentiment (50%) + analyst (50%)
                composite_score = (
                    sentiment_score * 0.50 +
                    analyst_score * 0.50
                )
                
                # Determine action for new investments
                if composite_score > 0.4:
                    action = 'STRONG BUY'  # Excellent entry point
                elif composite_score > 0.1:
                    action = 'BUY'  # Good entry point
                elif composite_score < -0.1:
                    action = 'AVOID'  # Don't invest
                else:
                    action = 'WATCH'  # Monitor for better signals
                
                result.update({
                    'compositeScore': round(composite_score, 4),
                    'action': action,
                    'reasoning': RecommendationService._generate_reasoning(
                        None, 
                        news_sentiment['average_sentiment'],
                        analyst_rec['recommendation'],
                        in_portfolio
                    )
                })
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing {'holding' if in_portfolio else 'stock'} {ticker}: {e}")
            return None
    
    @staticmethod
    def _generate_reasoning(performance_pct: Optional[float], sentiment: str, analyst_rec: str, in_portfolio: bool) -> str:
        """Generate human-readable reasoning for recommendation"""
        parts = []
        
        if in_portfolio and performance_pct is not None:
            if performance_pct > 10:
                parts.append(f"Strong performance (+{performance_pct:.1f}%)")
            elif performance_pct > 0:
                parts.append(f"Positive returns (+{performance_pct:.1f}%)")
            elif performance_pct < -10:
                parts.append(f"Significant losses ({performance_pct:.1f}%)")
            else:
                parts.append(f"Negative returns ({performance_pct:.1f}%)")
        
        parts.append(f"{sentiment} news sentiment")
        parts.append(f"analysts {analyst_rec.replace('_', ' ')}")
        
        if not in_portfolio:
            parts.append("not currently in portfolio")
        
        return ", ".join(parts)
    
    @staticmethod
    def get_portfolio_recommendations(holdings: List[Dict]) -> Dict:
        """
        Analyze entire portfolio and generate recommendations
        Uses parallel processing for speed
        """
        try:
            recommendations = []
            
            # Parallel analysis of all holdings
            with ThreadPoolExecutor(max_workers=10) as executor:
                future_to_holding = {
                    executor.submit(RecommendationService.analyze_holding, holding): holding 
                    for holding in holdings
                }
                
                for future in as_completed(future_to_holding):
                    result = future.result()
                    if result:
                        recommendations.append(result)
            
            if not recommendations:
                return None
            
            # Sort by composite score (best opportunities first)
            recommendations.sort(key=lambda x: x['compositeScore'], reverse=True)
            
            # Categorize recommendations
            strong_buys = [r for r in recommendations if r['action'] == 'STRONG BUY']
            buys = [r for r in recommendations if r['action'] == 'BUY']
            holds = [r for r in recommendations if r['action'] == 'HOLD']
            sells = [r for r in recommendations if r['action'] == 'SELL']
            strong_sells = [r for r in recommendations if r['action'] == 'STRONG SELL']
            
            return {
                'datetime': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'totalAnalyzed': len(recommendations),
                'summary': {
                    'strongBuys': len(strong_buys),
                    'buys': len(buys),
                    'holds': len(holds),
                    'sells': len(sells),
                    'strongSells': len(strong_sells)
                },
                'recommendations': recommendations,
                'topOpportunities': strong_buys[:5] + buys[:5],  # Top 10 opportunities
                'concernedHoldings': strong_sells[:5] + sells[:5]  # Holdings to review
            }
            
        except Exception as e:
            logger.error(f"Error generating portfolio recommendations: {e}")
            return None


def register_recommendation_routes(app):
    """Register recommendation endpoints"""
    from flask import jsonify, request
    
    @app.route('/api/portfolio/recommendations', methods=['POST'])
    def get_portfolio_recommendations_route():
        """
        Generate comprehensive portfolio recommendations
        Combines news sentiment (FinBERT), analyst recommendations, and performance
        """
        try:
            data = request.get_json()
            if not data or 'holdings' not in data:
                return jsonify({'error': 'holdings array required in request body'}), 400
            
            holdings = data.get('holdings', [])
            if not isinstance(holdings, list) or len(holdings) == 0:
                return jsonify({'error': 'holdings must be a non-empty array'}), 400
            
            result = RecommendationService.get_portfolio_recommendations(holdings)
            if not result:
                return jsonify({'error': 'Unable to generate recommendations'}), 404
            
            return jsonify(result), 200
        except Exception as e:
            logger.error(f"Error in get_portfolio_recommendations: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/stock/<symbol>/analysis', methods=['GET'])
    def get_stock_analysis_route(symbol):
        """
        Get comprehensive analysis for a single stock
        Query params:
        - inPortfolio (bool): Whether stock is in your portfolio (default: false)
        - buyPrice (float): Required if inPortfolio=true
        """
        try:
            in_portfolio = request.args.get('inPortfolio', 'false').lower() == 'true'
            buy_price = request.args.get('buyPrice', type=float)
            
            holding = {'ticker': symbol}
            
            if in_portfolio:
                if not buy_price:
                    return jsonify({
                        'error': 'buyPrice is required when inPortfolio=true'
                    }), 400
                holding['buyPrice'] = buy_price
            
            result = RecommendationService.analyze_holding(holding, in_portfolio=in_portfolio)
            if not result:
                return jsonify({'error': 'Unable to analyze stock'}), 404
            
            return jsonify(result), 200
        except Exception as e:
            logger.error(f"Error in get_stock_analysis: {e}")
            return jsonify({'error': str(e)}), 500
