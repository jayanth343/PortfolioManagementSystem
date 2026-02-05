
import re
import yfinance as yf
from typing import Optional, List, Dict
import logging
from flask import jsonify, request
from flask_socketio import emit
import html
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import math


logger = logging.getLogger(__name__)

# Store active WebSocket connections and their tickers
# Format: {sid: {'ticker': str, 'active': bool, 'thread': Thread}}
active_connections = {}


def sanitize_value(value):
    """
    Convert NaN, inf, and -inf values to None for JSON serialization.
    Returns None for any non-finite numeric value.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if math.isnan(value) or math.isinf(value):
            return None
    return value

def get_news(symbol):
    """Get formatted news for a symbol using the standard format_news function"""
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.get_news(count=10) if hasattr(ticker, 'news') else []
        formatted = StockService.format_news(news)
        return formatted
        
    except Exception as e:
        logger.error(f"Error fetching news for {symbol}: {str(e)}")
        return []
    

class StockService:
    @staticmethod
    def get_news(symbol):
        """Get formatted news for a symbol using the standard format_news function"""
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.get_news(count=10) if hasattr(ticker, 'news') else []
            formatted = StockService.format_news(news)
            return formatted
            
        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return []
    
    
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
            news = StockService.format_news(stock.get_news(count=5) if hasattr(stock, 'news') else [],)
            
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
                'exchange': sanitize_value(info.get('exchange')),
                'dividendYield': sanitize_value(info.get('dividendYield')),
                'sector': sanitize_value(info.get('sector')),
                'industry': sanitize_value(info.get('industry')),
                'volume': sanitize_value(info.get('volume')),
                'fiftyTwoWeekHigh': sanitize_value(info.get('fiftyTwoWeekHigh')),
                'fiftyTwoWeekLow': sanitize_value(info.get('fiftyTwoWeekLow')),
                'fiftyDayAverage': sanitize_value(info.get('fiftyDayAverage')),
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else None,
                'website': sanitize_value(info.get('website')),
                'country': sanitize_value(info.get('country')),
                'employees': sanitize_value(info.get('fullTimeEmployees')),
                'news': news,
                'recommendations': recommendations,
                'analystTargetPrice': sanitize_value(info.get('targetMeanPrice'))
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
                'totalSupply': sanitize_value(info.get('totalSupply')),
                'marketCap': sanitize_value(info.get('marketCap')),
                'priceChangePercent7d': round(((current_price - price_7d_ago) / price_7d_ago) * 100, 2) if price_7d_ago > 0 else None,
                'priceChangePercent30d': round(((current_price - price_30d_ago) / price_30d_ago) * 100, 2) if price_30d_ago > 0 else None,
                'allTimeHigh': sanitize_value(info.get('fiftyTwoWeekHigh')),
                'allTimeLow': sanitize_value(info.get('fiftyTwoWeekLow')),
                'volume24h': sanitize_value(info.get('volume')),
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else None,
                'news': get_news(symbol)
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
                    
                    # Asset classes
                    try:
                        if hasattr(funds_info, 'asset_classes') and funds_info.asset_classes is not None:
                            fund_data['assetClasses'] = funds_info.asset_classes if not funds_info.asset_classes.empty else []
                        else:
                            fund_data['assetClasses'] = []
                    except Exception as e:
                        logger.debug(f"Error fetching asset_classes: {e}")
                        fund_data['assetClasses'] = []
                    
                    # Top holdings
                    try:
                        if hasattr(funds_info, 'top_holdings') and funds_info.top_holdings is not None:
                            fund_data['topHoldings'] = funds_info.top_holdings.to_dict('records') if not funds_info.top_holdings.empty else []
                        else:
                            fund_data['topHoldings'] = []
                    except Exception as e:
                        logger.debug(f"Error fetching top_holdings: {e}")
                        fund_data['topHoldings'] = []
                    
                    # Equity holdings
                    try:
                        if hasattr(funds_info, 'equity_holdings') and funds_info.equity_holdings is not None:
                            fund_data['equityHoldings'] = funds_info.equity_holdings.to_dict()
                        else:
                            fund_data['equityHoldings'] = {}
                    except Exception as e:
                        logger.debug(f"Error fetching equity_holdings: {e}")
                        fund_data['equityHoldings'] = {}
                    
                    # Sector weightings
                    try:
                        if hasattr(funds_info, 'sector_weightings') and funds_info.sector_weightings is not None:
                            fund_data['sectorWeightings'] = funds_info.sector_weightings if not funds_info.sector_weightings.empty else []
                        else:
                            fund_data['sectorWeightings'] = []
                    except Exception as e:
                        logger.debug(f"Error fetching sector_weightings: {e}")
                        fund_data['sectorWeightings'] = []
                        
            except Exception as e:
                logger.error(f"Could not fetch fund_data for {symbol}: {e}")

            return {
                'schemeCode': yf_symbol,
                'name': info.get('longName', info.get('shortName', symbol)),
                'nav': round(current_nav, 4),
                'currency': info.get('currency', 'USD'),
                'category': sanitize_value(info.get('category')),
                'subCategory': sanitize_value(info.get('legalType')),
                'riskLevel': risk_level,
                'rating': sanitize_value(info.get('morningStarOverallRating')),
                'returns1Month': sanitize_value(returns_1m),
                'returns3Month': sanitize_value(returns_3m),
                'returns6Month': sanitize_value(returns_6m),
                'returns1Year': sanitize_value(returns_1y),
                'returns3Year': sanitize_value(returns_3y),
                'returns5Year': sanitize_value(returns_5y),
                'fundSize': sanitize_value(info.get('totalAssets')),
                'dividendYield': sanitize_value(info.get('yield')),
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
                'exchange': sanitize_value(info.get('exchange')),
                'volume': sanitize_value(info.get('volume')),
                'fiftyTwoWeekHigh': sanitize_value(info.get('fiftyTwoWeekHigh')),
                'fiftyTwoWeekLow': sanitize_value(info.get('fiftyTwoWeekLow')),
                'priceChangePercent7d': round(((current_price - price_7d_ago) / price_7d_ago) * 100, 2) if price_7d_ago > 0 else None,
                'priceChangePercent30d': round(((current_price - price_30d_ago) / price_30d_ago) * 100, 2) if price_30d_ago > 0 else None,
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else None,
            }
            
        except Exception as e:
            logger.error(f"Error fetching commodity data for {symbol}: {str(e)}")
            return None

    @staticmethod
    def get_stock_history(ticker: str, period: str = "1mo",interval:str = None):

        HistoryMapping = {
            '1D':['1d','1m'],
            '5D':['5d', '5m'],
            '1W':['7d', '1h'],
            '1MO':['1mo', '1h'],
            '3MO':['3mo', '1d'],
            '6MO':['6mo', '1d'],
            '1Y':['1y', '1d'],
            '5Y':['5y', '1d'],
            'MAX':['max', '1mo'],
            }
        
        try:
            stock = yf.Ticker(ticker)
            print(f"O: {ticker}, P: {period}, I: {interval}")
            if interval!=None:
                historyInterval = interval.lower()
                historyPeriod = period.lower()
            else:
                historyPeriod, historyInterval = HistoryMapping.get(period.upper(), ['1mo', '1d'])
            print(f"Fetching history for {ticker} with period: {historyPeriod}, interval: {historyInterval}")
            history = stock.history(period=historyPeriod, interval=historyInterval)
            
            if history.empty:
                return None
            
            # Determine if we're dealing with intraday data
            is_intraday = historyInterval in ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h']
            
            return {
                'ticker': ticker.upper(),
                'period': period,
                'interval': historyInterval,
                'data': [
                    {
                        # For intraday: use Unix timestamp (seconds)
                        # For daily+: use 'YYYY-MM-DD' string
                        'time': int(idx.timestamp()) if is_intraday else idx.strftime('%Y-%m-%d'),
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
                exchange_currency_map = {
                    'NSI': 'INR', 'BSE': 'INR',  # India
                    'NYSE': 'USD', 'NMS': 'USD', 'NYQ': 'USD', 'NGM': 'USD', 'PNK': 'USD',  # USA
                    'LSE': 'GBP', 'LON': 'GBP',  # UK
                }
            
                lookup = yf.Lookup(query) if yf.Lookup(query) else yf.Search(query).quotes
                
                stocks_df = (lookup.get_stock(count=5)).to_dict('index') if not lookup.get_stock(count=5).empty else {}
                mutualfunds_df = (lookup.get_mutualfund(count=5)).to_dict('index') if not lookup.get_mutualfund(count=5).empty else {}
                cryptos_df = (lookup.get_cryptocurrency(count=5)).to_dict('index') if not lookup.get_cryptocurrency(count=5).empty else {}
                commodities_df = (lookup.get_future(count=5)).to_dict('index') if not lookup.get_future(count=5).empty else {}
                
                # Convert from {symbol: {data}} to [{symbol: symbol, ...data}]
                def dict_to_list_with_symbol(data_dict):
                    result = []
                    for symbol, data in data_dict.items():
                        item = {'symbol': symbol}
                        for key, value in data.items():
                            item[key] = sanitize_value(value)
                        
                        exchange = data.get('exchange', '')
                        item['currency'] = exchange_currency_map.get(exchange, 'USD')
                        
                        result.append(item)
                    return result
                
                response = {
                    "stocks": dict_to_list_with_symbol(stocks_df),
                    "mutualFunds": dict_to_list_with_symbol(mutualfunds_df),
                    "cryptos": dict_to_list_with_symbol(cryptos_df),
                    "commodities": dict_to_list_with_symbol(commodities_df)
                }
                
                return response
                
        except Exception as e:
            logger.error(f"Error searching assets: {e}")
            return []
    
    @staticmethod
    def get_news(symbol):
        """Get formatted news for a symbol using the standard format_news function"""
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.get_news(count=10) if hasattr(ticker, 'news') else []
            formatted = StockService.format_news(news)
            return formatted
            
        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return []
    
    @staticmethod
    def get_performers_from_portfolio(holdings: List[Dict]):
        """
        Get top 5 best and worst performers from a list of holdings
        holdings: List of dicts with 'ticker', 'buyPrice', 'quantity', and optional 'purchaseDate' keys
        Uses parallel processing for faster execution
        
        Thresholds:
        - Best performers: gainLossPercent >= 5%
        - Worst performers: gainLossPercent <= -5%
        """
        from datetime import datetime
        
        # Define performance thresholds
        BEST_THRESHOLD = 5.0  # Minimum 5% gain to be considered "best"
        WORST_THRESHOLD = -5.0  # Maximum -5% loss to be considered "worst"
        
        def detect_asset_type(ticker: str, info: dict) -> str:
            """Detect asset type from ticker symbol and yfinance info"""
            ticker_upper = ticker.upper()
            quote_type = info.get('quoteType', '').upper()
            
            # Check quote type from yfinance
            if quote_type == 'CRYPTOCURRENCY':
                return 'Crypto'
            elif quote_type == 'MUTUALFUND' or quote_type == 'ETF':
                return 'Mutual Fund'
            elif quote_type == 'FUTURE':
                return 'Commodity'
            elif quote_type == 'EQUITY':
                return 'Stock'
            
            # Fallback to ticker pattern matching
            if '-USD' in ticker_upper or 'BTC' in ticker_upper or 'ETH' in ticker_upper:
                return 'Crypto'
            elif '=F' in ticker_upper or ticker_upper in ['GC', 'SI', 'CL', 'NG']:
                return 'Commodity'
            elif ticker_upper.endswith('X') and len(ticker_upper) == 5:
                return 'Mutual Fund'
            else:
                return 'Stock'
        
        def calculate_holding_period(purchase_date_str: str) -> tuple:
            """Calculate holding period in days and years"""
            try:
                purchase_date = datetime.strptime(purchase_date_str, '%Y-%m-%d')
                today = datetime.now()
                days_held = (today - purchase_date).days
                years_held = days_held / 365.25
                return days_held, years_held
            except Exception as e:
                logger.debug(f"Could not parse purchase date: {e}")
                return None, None
        
        def fetch_stock_performance(holding):
            """Helper function to fetch a single stock's performance"""
            ticker = holding.get('ticker', '').strip().upper()
            buy_price = holding.get('buyPrice')
            quantity = holding.get('quantity', 1)
            purchase_date = holding.get('purchaseDate')
            
            if not ticker or buy_price is None or buy_price <= 0:
                logger.warning(f"Invalid holding data: {holding}")
                return None
            
            if quantity is None or quantity <= 0:
                logger.warning(f"Invalid quantity for {ticker}, defaulting to 1")
                quantity = 1
            
            try:
                stock = yf.Ticker(ticker)
                history = stock.history(period="1d")
                
                if history.empty:
                    logger.warning(f"No price data for {ticker}")
                    return None
                
                current_price = float(history['Close'].iloc[-1])
                info = stock.info
                
                # Calculate basic metrics
                investment_value = buy_price * quantity
                current_value = current_price * quantity
                gain_loss_per_share = current_price - buy_price
                gain_loss_percent = (gain_loss_per_share / buy_price) * 100 if buy_price > 0 else 0
                total_gain_loss = gain_loss_per_share * quantity
                
                # Detect asset type
                asset_type = detect_asset_type(ticker, info)
                
                # Calculate holding period and annualized return
                days_held, years_held = None, None
                annualized_return = None
                
                if purchase_date:
                    days_held, years_held = calculate_holding_period(purchase_date)
                    if years_held and years_held > 0:
                        # CAGR formula: ((Ending Value / Beginning Value) ^ (1 / Years)) - 1
                        annualized_return = round((((current_price / buy_price) ** (1 / years_held)) - 1) * 100, 2)
                
                # Get additional info from yfinance
                sector = sanitize_value(info.get('sector'))
                industry = sanitize_value(info.get('industry'))
                currency = info.get('currency', 'USD')
                market_cap = sanitize_value(info.get('marketCap'))
                volume = sanitize_value(info.get('volume'))
                
                return {
                    'symbol': ticker,
                    'name': info.get('longName', info.get('shortName', ticker)),
                    'assetType': asset_type,
                    'sector': sector,
                    'industry': industry,
                    'currency': currency,
                    'price': round(current_price, 2),
                    'buyPrice': round(buy_price, 2),
                    'quantity': quantity,
                    'investmentValue': round(investment_value, 2),
                    'currentValue': round(current_value, 2),
                    'gainLossPerShare': round(gain_loss_per_share, 2),
                    'totalGainLoss': round(total_gain_loss, 2),
                    'gainLossPercent': round(gain_loss_percent, 2),
                    'daysHeld': days_held,
                    'annualizedReturn': sanitize_value(annualized_return),
                    'marketCap': market_cap,
                    'volume': volume
                }
                
            except Exception as e:
                logger.error(f"Error fetching data for {ticker}: {e}")
                return None
        
        try:
            performances = []
            
            with ThreadPoolExecutor(max_workers=20) as executor:
                future_to_holding = {executor.submit(fetch_stock_performance, holding): holding 
                                    for holding in holdings}
                
                for future in as_completed(future_to_holding):
                    result = future.result()
                    if result:
                        performances.append(result)
            
            if not performances:
                return None
            
            # Calculate total portfolio value and weights
            total_portfolio_value = sum(p['currentValue'] for p in performances)
            for p in performances:
                p['portfolioWeight'] = round((p['currentValue'] / total_portfolio_value) * 100, 2) if total_portfolio_value > 0 else 0
            
            # Sort by gain/loss percentage
            sorted_performances = sorted(performances, key=lambda x: x['gainLossPercent'], reverse=True)
            
            # Filter best performers (above threshold)
            best_candidates = [p for p in sorted_performances if p['gainLossPercent'] >= BEST_THRESHOLD]
            best_performers = best_candidates[:5]  # Top 5 from qualified candidates
            
            # Filter worst performers (below threshold, excluding those already in best)
            best_symbols = {p['symbol'] for p in best_performers}
            worst_candidates = [p for p in sorted_performances 
                              if p['gainLossPercent'] <= WORST_THRESHOLD 
                              and p['symbol'] not in best_symbols]
            worst_performers = worst_candidates[-5:] if worst_candidates else []  # Bottom 5 from qualified candidates
            worst_performers.reverse()  # Show worst first
            
            # Combine with type indicator
            data = []
            for performer in best_performers:
                performer['type'] = 'best'
                data.append(performer)
            
            for performer in worst_performers:
                performer['type'] = 'worst'
                data.append(performer)
            
            # Calculate portfolio summary
            total_investment = sum(p['investmentValue'] for p in performances)
            total_current_value = sum(p['currentValue'] for p in performances)
            total_gain_loss = total_current_value - total_investment
            total_gain_loss_percent = round((total_gain_loss / total_investment) * 100, 2) if total_investment > 0 else 0
            
            return {
                'datetime': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'bestCount': len(best_performers),
                'worstCount': len(worst_performers),
                'thresholds': {
                    'best': BEST_THRESHOLD,
                    'worst': WORST_THRESHOLD
                },
                'portfolioSummary': {
                    'totalInvestment': round(total_investment, 2),
                    'totalCurrentValue': round(total_current_value, 2),
                    'totalGainLoss': round(total_gain_loss, 2),
                    'totalGainLossPercent': total_gain_loss_percent,
                    'totalAssets': len(performances)
                },
                'data': data
            }
            
        except Exception as e:
            logger.error(f"Error in get_performers_from_portfolio: {str(e)}")
            return None
    
    @staticmethod
    def format_news(news_items: List):
        formatted_news = []
        for item in news_items:
            try:
                # Check if news item has 'content' wrapper (yfinance format)
                if 'content' in item:
                    content = item.get('content', {})
                    
                    # Extract thumbnail URL
                    thumbnail = None
                    thumbnail_data = content.get('thumbnail', {})
                    if thumbnail_data:
                        # Try to get the first resolution URL
                        resolutions = thumbnail_data.get('resolutions', [])
                        if resolutions and len(resolutions) > 0:
                            thumbnail = resolutions[0].get('url')
                        # Fallback to original URL if resolutions not available
                        if not thumbnail:
                            thumbnail = thumbnail_data.get('originalUrl')
                    
                    # Extract provider/publisher
                    provider = content.get('provider', {})
                    publisher = provider.get('displayName')
                    
                    # Extract article URL (prefer clickThroughUrl over canonicalUrl)
                    click_through = content.get('clickThroughUrl', {})
                    canonical = content.get('canonicalUrl', {})
                    url = click_through.get('url') if click_through.get('url') else canonical.get('url')
                    
                    formatted_news.append({
                        'title': content.get('title'),
                        'summary': content.get('summary'),
                        'publisher': publisher,
                        'publishedAt': content.get('pubDate'),
                        'url': url,
                        'thumbnail': thumbnail
                    })
                else:
                    # Fallback for already-formatted news
                    formatted_news.append({
                        'title': item.get('title'),
                        'summary': item.get('summary'),
                        'publisher': item.get('publisher'),
                        'publishedAt': item.get('publishedAt'),
                        'url': item.get('url') or item.get('link'),
                        'thumbnail': item.get('thumbnail')
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
            print(request)
            interval = request.args.get('interval', "15m").lower()
            print(interval)
            data = StockService.get_stock_history(symbol.upper(), period, interval)
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
            return jsonify(news), 200
        except Exception as e:
            logger.error(f"Error in get_news: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/portfolio/performers', methods=['POST'])
    def get_portfolio_performers_route():
        """Analyze portfolio and return top 5 best and worst performers"""
        try:
            data = request.get_json()
            if not data or 'holdings' not in data:
                return jsonify({'error': 'holdings array required in request body'}), 400
            
            holdings = data.get('holdings', [])
            if not isinstance(holdings, list) or len(holdings) == 0:
                return jsonify({'error': 'holdings must be a non-empty array'}), 400
            
            result = StockService.get_performers_from_portfolio(holdings)
            if not result:
                return jsonify({'error': 'Unable to analyze portfolio performers'}), 404
            
            return jsonify(result), 200
        except Exception as e:
            logger.error(f"Error in get_portfolio_performers: {e}")
            return jsonify({'error': str(e)}), 500


def register_websocket_events(socketio):
    """Register WebSocket event handlers for live price streaming"""
    
    @socketio.on('connect')
    def handle_connect():
        logger.info(f"Client connected: {request.sid}")
        emit('connected', {'message': 'Successfully connected to stock price stream'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info(f"Client disconnected: {request.sid}")
        # Stop any active price streaming for this client
        if request.sid in active_connections:
            active_connections[request.sid]['active'] = False
            # Wait for thread to finish (with timeout)
            thread = active_connections[request.sid].get('thread')
            if thread and thread.is_alive():
                thread.join(timeout=1.0)  # Wait max 1 second
            del active_connections[request.sid]
            logger.info(f"Cleaned up thread for client {request.sid}")
    
    @socketio.on('subscribe_ticker')
    def handle_subscribe_ticker(data):
        """Subscribe to live price updates for a specific ticker"""
        try:
            ticker = data.get('ticker', '').strip().upper()
            if not ticker:
                emit('error', {'message': 'Ticker symbol is required'})
                return
            
            # Validate ticker exists
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                if not info or 'symbol' not in info:
                    emit('error', {'message': f'Invalid ticker symbol: {ticker}'})
                    return
            except Exception as e:
                emit('error', {'message': f'Failed to validate ticker: {str(e)}'})
                return
            
            # Capture the session ID before starting the thread
            client_sid = request.sid
            
            logger.info(f"Client {client_sid} subscribed to {ticker}")
            
            # Stop any existing subscription for this client
            if client_sid in active_connections:
                active_connections[client_sid]['active'] = False
                # Wait for old thread to finish
                old_thread = active_connections[client_sid].get('thread')
                if old_thread and old_thread.is_alive():
                    old_thread.join(timeout=1.0)
            
            # Define the streaming function
            def stream_prices(sid):
                while active_connections.get(sid, {}).get('active', False):
                    try:
                        stock = yf.Ticker(ticker)
                        stock_info = stock.info
                        # Get latest price data
                        history = stock.history(period="1d", interval="1m")
                        latest_timestamp = history.index[-1]  # Get the datetime index
                        print(f"Latest timestamp for {ticker}: {latest_timestamp}")
                        print(f"Streaming price for {stock_info.get('shortName', ticker)}, history length: {len(history)}")
                        if not history.empty:
                            latest = history.iloc[-1]
                            current_price = float(latest['Close'])
                            open_price = float(history.iloc[0]['Open'])
                            high_price = float(max(history['High']))
                            low_price = float(min(history['Low']))
                            volume = int(latest['Volume'] if latest['Volume'] != 0 else stock.info.get('volume', 0))
                            
                            # Calculate change
                            day_open = history.iloc[0]['Open']
                            change = current_price - day_open
                            change_percent = (change / day_open * 100) if day_open  > 0 else 0
                            
                            price_data = {
                                'ticker': ticker,
                                'currency': stock_info.get('currency', 'USD'),
                                'name': stock_info.get('shortName', ticker),
                                
                                'price': round(current_price, 2),
                                'open': round(open_price, 2),
                                'high': round(high_price, 2),
                                'low': round(low_price, 2),
                                'volume': volume,
                                'change': round(change, 2),
                                'changePercent': round(change_percent, 2),
                                'timestamp': latest_timestamp.strftime('%Y-%m-%d %H:%M:%S')
                            }
                            
                            socketio.emit('price_update', price_data, room=sid)
                            logger.debug(f"Sent price update for {ticker} to {sid}: ${current_price}")
                        else:
                            logger.warning(f"No price data available for {ticker}")
                        
                        # Wait before next update (2 minutes to prevent rate limiting)
                        time.sleep(120)
                        
                    except Exception as e:
                        logger.error(f"Error streaming price for {ticker}: {e}")
                        socketio.emit('error', {'message': f'Error fetching price: {str(e)}'}, room=sid)
                        time.sleep(120)
                
                logger.info(f"Stopped streaming {ticker} for client {sid}")
            
            # Start the streaming thread, passing the sid as an argument
            thread = threading.Thread(target=stream_prices, args=(client_sid,), daemon=True)
            
            # Create new subscription with thread reference
            active_connections[client_sid] = {
                'ticker': ticker,
                'active': True,
                'thread': thread
            }
            
            emit('subscribed', {'ticker': ticker, 'message': f'Subscribed to {ticker}'})
            
            # Start the thread after defining the function
            thread.start()
            
        except Exception as e:
            logger.error(f"Error in subscribe_ticker: {e}")
            emit('error', {'message': str(e)})
    
    @socketio.on('unsubscribe_ticker')
    def handle_unsubscribe_ticker():
        """Unsubscribe from live price updates"""
        try:
            if request.sid in active_connections:
                ticker = active_connections[request.sid].get('ticker', 'Unknown')
                active_connections[request.sid]['active'] = False
                
                # Wait for thread to finish
                thread = active_connections[request.sid].get('thread')
                if thread and thread.is_alive():
                    thread.join(timeout=1.0)
                
                del active_connections[request.sid]
                logger.info(f"Client {request.sid} unsubscribed from {ticker}")
                emit('unsubscribed', {'message': 'Successfully unsubscribed'})
            else:
                emit('error', {'message': 'No active subscription found'})
        except Exception as e:
            logger.error(f"Error in unsubscribe_ticker: {e}")
            emit('error', {'message': str(e)})    
    @socketio.on('subscribe_ticker_fast')
    def handle_subscribe_ticker_fast(data):
        """Subscribe to live price updates for a specific ticker with 5-second interval (for buy modal)"""
        try:
            ticker = data.get('ticker', '').strip().upper()
            if not ticker:
                emit('error', {'message': 'Ticker symbol is required'})
                return
            
            # Validate ticker exists
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                if not info or 'symbol' not in info:
                    emit('error', {'message': f'Invalid ticker symbol: {ticker}'})
                    return
            except Exception as e:
                emit('error', {'message': f'Failed to validate ticker: {str(e)}'})
                return
            
            # Capture the session ID before starting the thread
            client_sid = request.sid
            
            logger.info(f"Client {client_sid} subscribed to {ticker} (fast mode)")
            
            # Stop any existing subscription for this client
            if client_sid in active_connections:
                active_connections[client_sid]['active'] = False
                # Wait for old thread to finish
                old_thread = active_connections[client_sid].get('thread')
                if old_thread and old_thread.is_alive():
                    old_thread.join(timeout=1.0)
            
            # Define the streaming function
            def stream_prices_fast(sid):
                while active_connections.get(sid, {}).get('active', False):
                    try:
                        stock = yf.Ticker(ticker)
                        stock_info = stock.info
                        # Get latest price data
                        history = stock.history(period="1d", interval="1m")
                        latest_timestamp = history.index[-1]  # Get the datetime index
                        
                        if not history.empty:
                            latest = history.iloc[-1]
                            current_price = float(latest['Close'])
                            open_price = float(history.iloc[0]['Open'])
                            high_price = float(max(history['High']))
                            low_price = float(min(history['Low']))
                            volume = int(latest['Volume'] if latest['Volume'] != 0 else stock.info.get('volume', 0))
                            
                            # Calculate change
                            day_open = history.iloc[0]['Open']
                            change = current_price - day_open
                            change_percent = (change / day_open * 100) if day_open > 0 else 0
                            
                            price_data = {
                                'ticker': ticker,
                                'currency': stock_info.get('currency', 'USD'),
                                'name': stock_info.get('shortName', ticker),
                                'price': round(current_price, 2),
                                'open': round(open_price, 2),
                                'high': round(high_price, 2),
                                'low': round(low_price, 2),
                                'volume': volume,
                                'change': round(change, 2),
                                'changePercent': round(change_percent, 2),
                                'timestamp': latest_timestamp.strftime('%Y-%m-%d %H:%M:%S')
                            }
                            
                            socketio.emit('price_update', price_data, room=sid)
                            logger.debug(f"Sent fast price update for {ticker} to {sid}: ${current_price}")
                        else:
                            logger.warning(f"No price data available for {ticker}")
                        
                        # Wait before next update (5 seconds for fast mode)
                        time.sleep(5)
                        
                    except Exception as e:
                        logger.error(f"Error streaming price for {ticker}: {e}")
                        socketio.emit('error', {'message': f'Error fetching price: {str(e)}'}, room=sid)
                        time.sleep(5)
                
                logger.info(f"Stopped streaming {ticker} for client {sid} (fast mode)")
            
            # Start the streaming thread, passing the sid as an argument
            thread = threading.Thread(target=stream_prices_fast, args=(client_sid,), daemon=True)
            
            # Create new subscription with thread reference
            active_connections[client_sid] = {
                'ticker': ticker,
                'active': True,
                'thread': thread
            }
            
            emit('subscribed', {'ticker': ticker, 'message': f'Subscribed to {ticker} (fast mode)'})
            
            # Start the thread after defining the function
            thread.start()
            
        except Exception as e:
            logger.error(f"Error in subscribe_ticker_fast: {e}")
            emit('error', {'message': str(e)})