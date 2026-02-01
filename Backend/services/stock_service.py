"""
Financial data service using yfinance for all asset types
Supports: Stocks, Cryptocurrencies, Commodities (Gold, Silver, etc.)
"""
import re
import yfinance as yf
from typing import Optional, List, Dict
import logging
from flask import jsonify, request
import html
import json


logger = logging.getLogger(__name__)

class StockService:
    
    @staticmethod
    def get_stock(ticker: str):
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # Get current and previous close
            history = stock.history(period="5d")
            if history.empty or len(history) < 2:
                logger.warning(f"Insufficient price history for {ticker}")
                return None
            
            current_price = float(history['Close'].iloc[-1])
            previous_close = float(history['Close'].iloc[-2])
            
            # Fetch news
            news = StockService._format_news(stock.get_news(count=5) if hasattr(stock, 'news') else [],)
            
            # Get recommendations
            recommendations = []
            try:
                rec_data = stock.recommendations
                if rec_data is not None and not rec_data.empty:
                    recent_rec = rec_data.tail(5)
                    recommendations = recent_rec.to_dict('records')
            except Exception as e:
                logger.debug(f"Could not fetch recommendations for {ticker}: {e}")
            
            day_change = round(current_price - previous_close, 2)
            day_change_percent = round((day_change / previous_close) * 100, 2) if previous_close > 0 else 0
            
            return {
                'tickerSymbol': ticker.upper(),
                'name': info.get('longName', info.get('shortName', ticker)),
                'currentPrice': round(current_price, 2),
                'previousClose': round(previous_close, 2),
                'dayChangePercent': day_change_percent,
                'currency': info.get('currency', 'USD'),
                'exchange': info.get('exchange'),
                'dividendYield': info.get('dividendYield'),
                'sector': info.get('sector'),
                'industry': info.get('industry'),
                'volume': info.get('volume'),
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh'),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow'),
                'fiftyDayAverage': info.get('fiftyDayAverage'),
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else None,
                'website': info.get('website'),
                'country': info.get('country'),
                'employees': info.get('fullTimeEmployees'),
                'news': news,
                'recommendations': recommendations,
                'analystTargetPrice': info.get('targetMeanPrice')
            }
            
        except Exception as e:
            logger.error(f"Error fetching stock data for {ticker}: {str(e)}")
            return None
    
    @staticmethod
    def get_crypto(symbol: str):

        try:
            yf_symbol = yf.Search(symbol,max_results=1).quotes[0]["symbol"]
            crypto = yf.Ticker(yf_symbol)

            info = crypto.info 
            
            history = crypto.history(period="5d")
            if history.empty or len(history) < 2:
                logger.warning(f"Insufficient price history for {symbol}")
                return None
            
            current_price = float(history['Close'].iloc[-1])
            previous_close = float(history['Close'].iloc[-2])
            
            history_30d = crypto.history(period="1mo")
            history_7d = crypto.history(period="7d")
            
            price_7d_ago = float(history_7d['Close'].iloc[0]) if len(history_7d) >= 7 else previous_close
            price_30d_ago = float(history_30d['Close'].iloc[0]) if len(history_30d) >= 20 else previous_close
            
            price_change_24h = round(current_price - previous_close, 2)
            price_change_percent_24h = round((price_change_24h / previous_close) * 100, 2) if previous_close > 0 else 0
            
            return {
                'symbol': symbol.upper(),
                'name': info.get('longName', info.get('shortName', symbol)),
                'currentPrice': round(current_price, 2),
                'previousClose': round(previous_close, 2),
                'priceChange24h': price_change_24h,
                'priceChangePercent24h': price_change_percent_24h,
                'currency': info.get('currency', 'USD'),
                'totalSupply': info.get('totalSupply'),
                'marketCap': info.get('marketCap'),
                'priceChangePercent7d': round(((current_price - price_7d_ago) / price_7d_ago) * 100, 2) if price_7d_ago > 0 else None,
                'priceChangePercent30d': round(((current_price - price_30d_ago) / price_30d_ago) * 100, 2) if price_30d_ago > 0 else None,
                'allTimeHigh': info.get('fiftyTwoWeekHigh'),
                'allTimeLow': info.get('fiftyTwoWeekLow'),
                'volume24h': info.get('volume'),
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else None,
                'news': []
            }
            
        except Exception as e:
            logger.error(f"Error fetching crypto data for {symbol}: {str(e)}")
            return None
    
    @staticmethod
    def get_mutual_fund(symbol: str):
        try:
            yf_symbol = yf.Search(symbol,max_results=1).quotes[0]["symbol"]
            fund = yf.Ticker(yf_symbol)
            info = fund.info
            
            history = fund.history(period="5d")
            if history.empty or len(history) < 2:
                logger.warning(f"Insufficient NAV history for {symbol}")
                return None
            
            current_nav = float(history['Close'].iloc[-1])
            previous_nav = float(history['Close'].iloc[-2])
            
            history_1m = fund.history(period="1mo")
            history_3m = fund.history(period="3mo")
            history_6m = fund.history(period="6mo")
            history_1y = fund.history(period="1y")
            history_3y = fund.history(period="3y")
            history_5y = fund.history(period="5y")
            
            # Calculate returns - simple for short periods, annualized for long periods
            def calculate_return(hist, current):
                """Calculate simple total return"""
                if not hist.empty and len(hist) > 1:
                    start_price = float(hist['Close'].iloc[0])
                    if start_price > 0:
                        return round(((current - start_price) / start_price) * 100, 2)
                return None
            
            def calculate_annualized_return(hist, current, years):
                """Calculate annualized return (CAGR)"""
                if not hist.empty and len(hist) > 1:
                    start_price = float(hist['Close'].iloc[0])
                    if start_price > 0 and years > 0:
                        return round((((current / start_price) ** (1/years)) - 1) * 100, 2)
                return None
            
            # Short-term returns (total return)
            returns_1m = calculate_return(history_1m, current_nav)
            returns_3m = calculate_return(history_3m, current_nav)
            returns_6m = calculate_return(history_6m, current_nav)
            returns_1y = calculate_return(history_1y, current_nav)
            
            returns_3y = calculate_annualized_return(history_3y, current_nav, 3)
            returns_5y = calculate_annualized_return(history_5y, current_nav, 5)            
            morningstar_risk = info.get('morningStarRiskRating')
            risk_level = None
            if morningstar_risk:
                risk_map = {1: "Low", 2: "Below Average", 3: "Average", 4: "Above Average", 5: "High"}
                risk_level = risk_map.get(morningstar_risk, "Unknown")
            
            fund_data = {}
            try:
                funds_info = fund.funds_data
                if funds_info:
                    fund_data['description'] = funds_info.description if hasattr(funds_info, 'description') else "N/A"
                    
                    fund_data['fundOverview'] = funds_info.fund_overview if hasattr(funds_info, 'fund_overview') and funds_info.fund_overview is not None else {}
                    fund_data['fundOperations'] = funds_info.fund_operations.to_dict() if hasattr(funds_info, 'fund_operations') and funds_info.fund_operations is not None else {}
                    
                    fund_data['assetClasses'] = funds_info.asset_classes if hasattr(funds_info, 'asset_classes') and funds_info.asset_classes is not None and not funds_info.asset_classes.empty else []
                    fund_data['topHoldings'] = funds_info.top_holdings.to_dict('records') if hasattr(funds_info, 'top_holdings') and funds_info.top_holdings is not None and not funds_info.top_holdings.empty else []
                    fund_data['equityHoldings'] = funds_info.equity_holdings.to_dict() if hasattr(funds_info, 'equity_holdings') and funds_info.equity_holdings is not None else {}
                    fund_data['sectorWeightings'] = funds_info.sector_weightings.to_dict('records') if hasattr(funds_info, 'sector_weightings') and funds_info.sector_weightings is not None and not funds_info.sector_weightings.empty else []
            except Exception as e:
                logger.debug(f"Could not fetch fund_data for {symbol}: {e}")

            return {
                'schemeCode': yf_symbol,
                'name': info.get('longName', info.get('shortName', symbol)),
                'nav': round(current_nav, 4),
                'currency': info.get('currency', 'USD'),
                'category': info.get('category'),
                'subCategory': info.get('legalType'),
                'riskLevel': risk_level,
                'rating': info.get('morningStarOverallRating'),
                'returns1Month': returns_1m,
                'returns3Month': returns_3m,
                'returns6Month': returns_6m,
                'returns1Year': returns_1y,
                'returns3Year': returns_3y,
                'returns5Year': returns_5y,
                'fundSize': info.get('totalAssets'),
                'dividendYield': info.get('yield'),
                'fundData': fund_data,
                'news': []
            }
            
        except Exception as e:
            logger.error(f"Error fetching mutual fund data for {symbol}: {str(e)}")
            return None
    

    @staticmethod
    def get_commodity(symbol: str):

        try:
            commodity = yf.Ticker(symbol)
            info = commodity.info
            
            history = commodity.history(period="5d")
            if history.empty or len(history) < 2:
                logger.warning(f"Insufficient price history for {symbol}")
                return None
            
            current_price = float(history['Close'].iloc[-1])
            previous_close = float(history['Close'].iloc[-2])
            
            history_30d = commodity.history(period="1mo")
            history_7d = commodity.history(period="7d")
            
            price_7d_ago = float(history_7d['Close'].iloc[0]) if len(history_7d) >= 7 else previous_close
            price_30d_ago = float(history_30d['Close'].iloc[0]) if len(history_30d) >= 20 else previous_close
            
            price_change = round(current_price - previous_close, 2)
            price_change_percent = round((price_change / previous_close) * 100, 2) if previous_close > 0 else 0
            
            return {
                'symbol': symbol.upper(),
                'name': info.get('longName', info.get('shortName', symbol)),
                'currentPrice': round(current_price, 2),
                'previousClose': round(previous_close, 2),
                'priceChange': price_change,
                'priceChangePercent': price_change_percent,
                'currency': info.get('currency', 'USD'),
                'exchange': info.get('exchange'),
                'volume': info.get('volume'),
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh'),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow'),
                'priceChangePercent7d': round(((current_price - price_7d_ago) / price_7d_ago) * 100, 2) if price_7d_ago > 0 else None,
                'priceChangePercent30d': round(((current_price - price_30d_ago) / price_30d_ago) * 100, 2) if price_30d_ago > 0 else None,
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else None,
            }
            
        except Exception as e:
            logger.error(f"Error fetching commodity data for {symbol}: {str(e)}")
            return None

    @staticmethod
    def get_stock_history(ticker: str, period: str = "1mo"):

        HistoryMapping = {
            
            '1D':['1d','30m'],
            '5D':['5d', '1h'],
            '1W':['7d', '4h'],
            '1MO':['1mo', '1wk'],
            '3MO':['3mo', '1wk'],
            '6MO':['6mo', '1wk'],
            '1Y':['1y', '1mo'],
            '2Y':['2y', '1mo'],
            
            }
        
        try:
            stock = yf.Ticker(ticker)
            historyPeriod, historyInterval = HistoryMapping.get(period.upper(), ['1mo', '1d'])
            history = stock.history(period=historyPeriod, interval=historyInterval)
            
            if history.empty:
                return None
            
            return {
                'ticker': ticker.upper(),
                'period': period,
                'interval': historyInterval,
                'data': [
                    {
                        'date': idx.strftime('%Y-%m-%d %H:%M:%S'),
                        'open': float(row['Open']),
                        'high': float(row['High']),
                        'low': float(row['Low']),
                        'close': float(row['Close']),
                        'volume': int(row['Volume'])
                    }
                    for idx, row in history.iterrows()
                ]
            }
        except Exception as e:
            logger.error(f"Error fetching history for {ticker}: {str(e)}")
            return None
    
    @staticmethod
    def search_assets(query: str):
        try:
            ticker = yf.Ticker(query)
            info = ticker.info
            
            if info and info.get('symbol'):
                return [{
                    'symbol': info.get('symbol'),
                    'name': info.get('longName', info.get('shortName')),
                    'exchange': info.get('exchange'),
                    'type': info.get('quoteType', 'N/A'),
                    "Industry": info.get('industry', 'N/A'),
                    "Currency": info.get('currency', 'N/A'),
                    "Website": info.get('website', 'N/A'),
                    "regularMarketPrice": info.get('regularMarketPrice', 'N/A')
                    
                }]
            else:
                lookup = yf.Lookup(query) if yf.Lookup(query) else yf.Search(query).quotes
                
                stocks_df = lookup.get_stock(count=2)
                mutualfunds_df = lookup.get_mutualfund(count=2)
                cryptos_df = lookup.get_cryptocurrency(count=2)
                commodities_df = lookup.get_future(count=2)
                
                response = {
                    "stocks": stocks_df.to_dict('records') if not stocks_df.empty else [],
                    "mutualFunds": mutualfunds_df.to_dict('records') if not mutualfunds_df.empty else [],
                    "cryptos": cryptos_df.to_dict('records') if not cryptos_df.empty else [],
                    "commodities": commodities_df.to_dict('records') if not commodities_df.empty else []
                }
                
                return response
                
        except Exception as e:
            logger.error(f"Error searching assets: {e}")
            return []
    
    @staticmethod
    def get_news(symbol):
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news
            result_list = []
            for item in news[:5]:
                content = item.get("content", {})
                click_url = content.get("clickThroughUrl")
                raw_description = content.get("description", "")
                # Remove HTML tags
                clean_description = re.sub(r'<[^>]*>', '', raw_description) if raw_description else ""
                # Decode HTML entities (like &nbsp;, &#39;, etc.)
                clean_description = html.unescape(clean_description)
                # Remove extra backslashes
                clean_description = clean_description.replace('\\', '')    
                entry = {
                    "title": content.get("title"),
                    "description": clean_description,
                    "summary": content.get("summary"),
                    "publication_date": content.get("pubDate"),
                    "url": click_url.get("url") if click_url else None,
                }
                result_list.append(entry)
            return json.dumps(result_list, indent=4)
            
        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return None
    
    @staticmethod
    def _format_news(news_items: List):
        formatted_news = []
        for item in news_items:
            try:
                content = item.get('content', {})
                thumbnail = None
                thumbnail_data = content.get('thumbnail', {})
                if thumbnail_data and thumbnail_data.get('resolutions'):
                    resolutions = thumbnail_data.get('resolutions', [])
                    if resolutions:
                        thumbnail = resolutions[0].get('url')
                provider = content.get('provider', {})
                canonical_url = content.get('canonicalUrl', {})
                formatted_news.append({
                    'title': content.get('title'),
                    'summary': content.get('summary'),
                    'date': content.get('pubDate'),
                    'publisher': provider.get('displayName'),
                    'publishedAt': content.get('pubDate'),
                    'link': canonical_url.get('url'),
                    'type': content.get('contentType'),
                    'thumbnail': thumbnail
                })
            except Exception as e:
                logger.debug(f"Error formatting news item: {e}")
                continue
                
        return formatted_news



def register_routes(app):
    
    @app.route('/api/stocks/<symbol>', methods=['GET'])
    def get_stock_route(symbol):
        try:
            data = StockService.get_stock(symbol.upper())
            if not data:
                return jsonify({'error': 'Stock not found'}), 404
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Error in get_stock: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/crypto/<symbol>', methods=['GET'])
    def get_crypto_route(symbol):
        try:
            data = StockService.get_crypto(symbol.upper())
            if not data:
                return jsonify({'error': 'Crypto not found'}), 404
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Error in get_crypto: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/mutual-funds/<symbol>', methods=['GET'])
    def get_mutual_fund_route(symbol):
        try:
            data = StockService.get_mutual_fund(symbol.upper())
            if not data:
                return jsonify({'error': 'Mutual fund not found'}), 404
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Error in get_mutual_fund: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/history/<symbol>', methods=['GET'])
    def get_history_route(symbol):
        try:
            period = request.args.get('period', '1MO').upper()
            data = StockService.get_stock_history(symbol.upper(), period)
            if not data:
                return jsonify({'error': 'History not found'}), 404
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Error in get_history: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/search', methods=['GET'])
    def search_route():
        try:
            query = request.args.get('q', '').strip()
            if not query:
                return jsonify({'error': 'Query parameter required'}), 400
            
            results = StockService.search_assets(query)
            return jsonify(results), 200
        except Exception as e:
            logger.error(f"Error in search: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/commodities/<symbol>', methods=['GET'])
    def get_commodity_route(symbol):
        """Get commodity/futures data"""
        try:
            data = StockService.get_commodity(symbol.upper())
            if not data:
                return jsonify({'error': 'Commodity not found'}), 404
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Error in get_commodity: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/news/<symbol>', methods=['GET'])
    def get_news_route(symbol):
        try:
            news = StockService.get_news(symbol.upper())
            if news is None:
                return jsonify({'error': 'News not found'}), 404
            return jsonify(news), 200
        except Exception as e:
            logger.error(f"Error in get_news: {e}")
            return jsonify({'error': str(e)}), 500

