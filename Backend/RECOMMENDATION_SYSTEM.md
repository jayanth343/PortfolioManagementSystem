# Portfolio Recommendation System

## Overview

The Portfolio Recommendation System is an AI-powered analysis engine that combines multiple financial data sources to generate actionable investment recommendations. The system analyzes stocks using three core components: **News Sentiment Analysis**, **Analyst Recommendations**, and **Price Performance Analysis**.

The system provides two modes of operation:
- **Portfolio Mode**: Analyzes existing holdings considering purchase price and current performance
- **Discovery Mode**: Evaluates potential investments without historical context

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Portfolio Recommendation System              │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────┐  ┌─────────────────┐           │
│  │ News Sentiment  │  │    Analyst      │           │
│  │   (FinBERT)     │  │ Recommendations │           │
│  └────────┬────────┘  └────────┬────────┘           │
│           │                    │                     │
│           └────────┬───────────┘                     │
│                    │                                 │
│         ┌──────────▼──────────┐                      │
│         │  Composite Scoring  │                      │
│         │    & Weighting      │                      │
│         └──────────┬──────────┘                      │
│                    │                                 │
│         ┌──────────▼──────────┐                      │
│         │ Action Generation   │                      │
│         │ BUY/SELL/HOLD/AVOID │                      │
│         └─────────────────────┘                      │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. News Sentiment Analysis (FinBERT)

**Purpose**: Analyzes recent news articles to determine market sentiment around a stock.

**Technology**: [FinBERT](https://huggingface.co/ProsusAI/finbert) - A BERT-based model fine-tuned on financial text for sentiment analysis.

**Process**:
1. Fetches latest 20 news articles for the ticker using `yfinance`
2. Extracts title and summary from each article
3. Processes each article through FinBERT to classify sentiment
4. Aggregates individual sentiments into overall score

**Sentiment Classification**:
- **Positive**: Bullish indicators, good news, favorable developments
- **Negative**: Bearish indicators, bad news, concerns
- **Neutral**: Mixed or factual information without clear direction

**Scoring Formula**:

```
Sentiment Value = {
  +score,  if sentiment = positive
  -score,  if sentiment = negative
   0,      if sentiment = neutral
}

Average Sentiment = Σ(sentiment_values) / n
where n = number of articles analyzed
```

**Overall Sentiment Determination**:
```
Overall = {
  positive,  if avg_score > +0.2
  negative,  if avg_score < -0.2
  neutral,   otherwise
}
```

**Implementation**:
```python
def analyze_sentiment(text: str) -> Dict:
    # Tokenize text with max length 512
    inputs = tokenizer(text, return_tensors="pt", 
                      padding=True, truncation=True, max_length=512)
    
    # Get model predictions
    outputs = model(**inputs)
    predictions = softmax(outputs.logits, dim=-1)
    
    # Extract sentiment and confidence
    sentiment_idx = argmax(predictions)
    confidence = predictions[0][sentiment_idx]
    
    return {'sentiment': label, 'score': confidence}
```

**References**:
- [FinBERT Paper](https://arxiv.org/abs/1908.10063)
- [FinBERT on HuggingFace](https://huggingface.co/ProsusAI/finbert)
- [Original BERT Paper](https://arxiv.org/abs/1810.04805)

---

### 2. Analyst Recommendations

**Purpose**: Aggregates professional analyst ratings to gauge institutional sentiment.

**Data Source**: Yahoo Finance via `yfinance` library

**Analyst Ratings Categories**:
- **Strong Buy**: Highest confidence buy recommendation
- **Buy**: Recommended purchase
- **Hold**: Maintain current position
- **Sell**: Recommended to reduce/exit
- **Strong Sell**: Highest confidence sell recommendation

**Weighted Scoring Formula**:

```
Weighted Score = (StrongBuy × 2 + Buy × 1 + Sell × (-1) + StrongSell × (-2)) / Total
where Total = StrongBuy + Buy + Hold + Sell + StrongSell
```

**Recommendation Mapping**:
```
Analyst Action = {
  strong_buy,   if weighted_score > +0.5
  buy,          if 0.0 < weighted_score ≤ +0.5
  hold,         if weighted_score = 0.0
  sell,         if -0.5 ≤ weighted_score < 0.0
  strong_sell,  if weighted_score < -0.5
}

Confidence = |weighted_score| / 2
```

**Example Calculation**:
```
Ratings: 15 Strong Buy, 10 Buy, 5 Hold, 2 Sell, 0 Strong Sell
Total = 32 analysts

Weighted = (15×2 + 10×1 + 5×0 + 2×(-1) + 0×(-2)) / 32
         = (30 + 10 + 0 - 2 + 0) / 32
         = 38 / 32
         = 1.1875

Result: strong_buy (since 1.1875 > 0.5)
Confidence: 1.1875 / 2 = 0.594 (59.4%)
```

**Implementation**:
```python
def get_analyst_recommendation(ticker: str) -> Dict:
    stock = yf.Ticker(ticker)
    rec_summary = stock.get_recommendations_summary()
    latest = rec_summary.iloc[0]  # Current period
    
    weighted_score = (
        latest['strongBuy'] * 2 + 
        latest['buy'] * 1 + 
        latest['sell'] * -1 + 
        latest['strongSell'] * -2
    ) / total_analysts
    
    return {
        'recommendation': map_score_to_action(weighted_score),
        'confidence': abs(weighted_score) / 2
    }
```

---

### 3. Price Performance Analysis

**Purpose**: Evaluates actual investment returns for portfolio holdings.

**Applicability**: Only for stocks in portfolio (requires buy price)

**Performance Metrics**:

```
Gain/Loss = Current Price - Buy Price

Gain/Loss % = (Current Price - Buy Price) / Buy Price × 100

Performance Score = clamp(Gain/Loss % / 50, -1, 1)
```

The performance score normalizes returns to a -1 to +1 scale:
- **+1.0**: ≥50% gains (excellent performance)
- **0.0**: Breakeven
- **-1.0**: ≥50% losses (poor performance)

**Example**:
```
Buy Price: $100
Current Price: $125
Gain: $25
Gain %: 25%
Performance Score: 25/50 = 0.5
```

---

## Composite Scoring System

The system uses different weighting schemes depending on context.

### Portfolio Holdings (In Portfolio)

For stocks you already own, performance history is a key factor:

```
Composite Score = (Performance × 0.30) + (Sentiment × 0.35) + (Analyst × 0.35)
```

**Weighting Rationale**:
- **30% Performance**: Historical returns indicate actual results
- **35% Sentiment**: Market perception drives short-term movements
- **35% Analyst**: Professional analysis provides expert perspective

### New Investments (Not In Portfolio)

For potential investments, focus on current signals:

```
Composite Score = (Sentiment × 0.50) + (Analyst × 0.50)
```

**Weighting Rationale**:
- **50% Sentiment**: Current market mood is critical for entry timing
- **50% Analyst**: Expert consensus guides strategic decisions
- **No Performance**: No historical data for this investor

---

## Action Determination

### Portfolio Holdings Actions

```
Action = {
  STRONG BUY,   if composite > +0.4   → Add significantly to position
  BUY,          if composite > +0.1   → Add to position
  HOLD,         if -0.1 ≤ composite ≤ +0.1 → Maintain current position
  SELL,         if composite < -0.1   → Reduce position
  STRONG SELL,  if composite < -0.4   → Exit position
}
```

**Decision Tree**:
```
composite_score
     │
     ├─── > +0.4  ──→  STRONG BUY  (High conviction addition)
     │
     ├─── +0.1 to +0.4  ──→  BUY  (Moderate addition)
     │
     ├─── -0.1 to +0.1  ──→  HOLD  (No action needed)
     │
     ├─── -0.4 to -0.1  ──→  SELL  (Reduce exposure)
     │
     └─── < -0.4  ──→  STRONG SELL  (Exit position)
```

### New Investment Actions

```
Action = {
  STRONG BUY,  if composite > +0.4   → Excellent entry point
  BUY,         if composite > +0.1   → Good entry point
  WATCH,       if -0.1 ≤ composite ≤ +0.1 → Monitor for signals
  AVOID,       if composite < -0.1   → Don't invest
}
```

---

## API Endpoints

### 1. Portfolio Recommendations

**Endpoint**: `POST /api/portfolio/recommendations`

**Description**: Analyzes multiple holdings in parallel and generates comprehensive portfolio recommendations.

**Request Body**:
```json
{
  "holdings": [
    {
      "ticker": "AAPL",
      "buyPrice": 150.00
    },
    {
      "ticker": "GOOGL",
      "buyPrice": 2800.00
    }
  ]
}
```

**Response**:
```json
{
  "datetime": "2026-02-03 14:30:00",
  "totalAnalyzed": 2,
  "summary": {
    "strongBuys": 1,
    "buys": 0,
    "holds": 1,
    "sells": 0,
    "strongSells": 0
  },
  "recommendations": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "currentPrice": 180.50,
      "buyPrice": 150.00,
      "gainLoss": 30.50,
      "gainLossPercent": 20.33,
      "newsSentiment": "positive",
      "sentimentScore": 0.45,
      "analystRecommendation": "buy",
      "analystConfidence": 0.65,
      "compositeScore": 0.52,
      "action": "STRONG BUY",
      "reasoning": "Strong performance (+20.3%), positive news sentiment, analysts buy",
      "inPortfolio": true
    }
  ],
  "topOpportunities": [...],
  "concernedHoldings": [...]
}
```

**Performance**: Uses ThreadPoolExecutor with 10 workers for parallel processing.

---

### 2. Single Stock Analysis

**Endpoint**: `GET /api/stock/{symbol}/analysis`

**Description**: Analyzes a single stock with optional portfolio context.

**Query Parameters**:
- `inPortfolio` (boolean): Whether stock is in your portfolio (default: false)
- `buyPrice` (float): Required if inPortfolio=true

**Example Requests**:

**New Investment Analysis**:
```
GET /api/stock/TSLA/analysis?inPortfolio=false
```

**Portfolio Holding Analysis**:
```
GET /api/stock/TSLA/analysis?inPortfolio=true&buyPrice=650.00
```

**Response (Not In Portfolio)**:
```json
{
  "symbol": "TSLA",
  "name": "Tesla, Inc.",
  "currentPrice": 750.25,
  "newsSentiment": "positive",
  "sentimentScore": 0.38,
  "analystRecommendation": "hold",
  "analystConfidence": 0.25,
  "compositeScore": 0.19,
  "action": "BUY",
  "reasoning": "positive news sentiment, analysts hold, not currently in portfolio",
  "inPortfolio": false
}
```

**Response (In Portfolio)**:
```json
{
  "symbol": "TSLA",
  "name": "Tesla, Inc.",
  "currentPrice": 750.25,
  "buyPrice": 650.00,
  "gainLoss": 100.25,
  "gainLossPercent": 15.42,
  "newsSentiment": "positive",
  "sentimentScore": 0.38,
  "analystRecommendation": "hold",
  "analystConfidence": 0.25,
  "compositeScore": 0.28,
  "action": "BUY",
  "reasoning": "Positive returns (+15.4%), positive news sentiment, analysts hold",
  "inPortfolio": true
}
```

---

## Mathematical Formulas Reference

### 1. Sentiment Aggregation
```
sentiment_value_i = {
  score_i,   if sentiment_i = positive
  -score_i,  if sentiment_i = negative
  0,         if sentiment_i = neutral
}

average_sentiment = (Σ sentiment_value_i) / n
where n = number of news articles
```

### 2. Analyst Weighted Score
```
weighted_score = (n_sb × 2 + n_b × 1 + n_s × (-1) + n_ss × (-2)) / n_total

where:
  n_sb = number of Strong Buy ratings
  n_b = number of Buy ratings
  n_s = number of Sell ratings
  n_ss = number of Strong Sell ratings
  n_total = total number of analyst ratings
```

### 3. Performance Normalization
```
performance_score = max(min(gain_loss_percent / 50, 1), -1)

This clamps values to [-1, 1] range:
  - Returns ≥ +50% → score = +1.0
  - Returns ≤ -50% → score = -1.0
  - Returns between → score = return% / 50
```

### 4. Composite Score (Portfolio)
```
composite = w_perf × score_perf + w_sent × score_sent + w_analyst × score_analyst

where:
  w_perf = 0.30 (30% weight)
  w_sent = 0.35 (35% weight)
  w_analyst = 0.35 (35% weight)
  
  score_perf ∈ [-1, 1]
  score_sent ∈ [-1, 1]
  score_analyst ∈ [-1, 1]
```

### 5. Composite Score (New Investment)
```
composite = w_sent × score_sent + w_analyst × score_analyst

where:
  w_sent = 0.50 (50% weight)
  w_analyst = 0.50 (50% weight)
```

---

## Dependencies

### Python Packages
```python
yfinance==1.1.0          # Market data and news
transformers==4.36.0     # FinBERT model
torch==2.1.0             # PyTorch for neural networks
flask==3.0.0             # API framework
flask-cors               # Cross-origin support
```

### External Services
- **Yahoo Finance API**: Real-time stock data, news, analyst recommendations
- **HuggingFace**: FinBERT model hosting

---

## Performance Optimization

### Parallel Processing

The system uses `ThreadPoolExecutor` for concurrent analysis:

```python
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {
        executor.submit(analyze_holding, h): h 
        for h in holdings
    }
    
    for future in as_completed(futures):
        recommendations.append(future.result())
```

**Benefits**:
- **100 stocks**: ~60 seconds sequential → ~10 seconds parallel
- **10 stocks**: ~6 seconds sequential → ~1 second parallel

### Model Caching

FinBERT model is lazy-loaded and cached:
```python
_finbert_model = None  # Class variable

@classmethod
def _get_finbert_model(cls):
    if cls._finbert_model is None:
        cls._finbert_model = load_model()
    return cls._finbert_model
```

**First call**: ~2-3 seconds (model loading)  
**Subsequent calls**: <0.1 seconds (cached)

---

## Limitations & Considerations

### 1. News Availability
- Some tickers may have limited news coverage
- Returns neutral sentiment (0.0) when no news available
- Minimum 20 articles requested, actual count may vary

### 2. Analyst Coverage
- Small-cap stocks may lack analyst recommendations
- Returns 'hold' with 0.0 confidence when unavailable
- Relies on Yahoo Finance data availability

### 3. Model Limitations
- FinBERT optimized for English financial text
- Max input length: 512 tokens (title + summary)
- Sentiment doesn't capture all market nuances

### 4. Performance Calculation
- Requires accurate buy price input
- Doesn't account for dividends or splits (use adjusted close if needed)
- Single buy price (doesn't handle multiple purchases at different prices)

### 5. Real-time Data
- Market data has ~15-minute delay (Yahoo Finance free tier)
- News sentiment reflects articles available at query time
- Analyst recommendations updated periodically

---

## Future Enhancements

### Planned Features
- [ ] **Technical Analysis**: RSI, MACD, Moving Averages, Bollinger Bands
- [ ] **Historical Volatility**: Standard deviation, beta calculation
- [ ] **Sector Comparison**: Relative performance vs sector indices
- [ ] **Risk Metrics**: Sharpe ratio, max drawdown, Value at Risk
- [ ] **Earnings Analysis**: EPS trends, revenue growth, guidance
- [ ] **Social Sentiment**: Reddit, Twitter sentiment integration
- [ ] **Backtesting**: Historical performance of recommendations

### Under Consideration
- Multiple buy price support (weighted average cost basis)
- Dividend tracking and yield analysis
- Options sentiment analysis
- Insider trading activity monitoring
- ESG (Environmental, Social, Governance) scoring

---

## References & Resources

### Academic Papers
1. **FinBERT**: [Financial Sentiment Analysis with Pre-trained Language Models](https://arxiv.org/abs/1908.10063)
2. **BERT**: [BERT: Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)
3. **Sentiment Analysis in Finance**: [Sentiment Analysis in Financial News](https://www.researchgate.net/publication/320387602_Sentiment_Analysis_in_Financial_News)

### Libraries & Tools
- [yfinance Documentation](https://github.com/ranaroussi/yfinance)
- [Transformers Library](https://huggingface.co/docs/transformers/index)
- [PyTorch Documentation](https://pytorch.org/docs/stable/index.html)
- [Flask Documentation](https://flask.palletsprojects.com/)

### Models
- [FinBERT on HuggingFace](https://huggingface.co/ProsusAI/finbert)
- [Model Card](https://huggingface.co/ProsusAI/finbert#model-card)

### Financial Resources
- [Investopedia - Analyst Ratings](https://www.investopedia.com/terms/a/analyst-rating.asp)
- [Investopedia - Sentiment Analysis](https://www.investopedia.com/terms/s/sentiment-analysis.asp)
- [Yahoo Finance API](https://finance.yahoo.com/)

---

## Example Use Cases

### Use Case 1: Portfolio Health Check
**Scenario**: Weekly review of 50-stock portfolio

**Request**:
```json
POST /api/portfolio/recommendations
{
  "holdings": [/* 50 stocks with buy prices */]
}
```

**Outcome**:
- Identifies top 5 opportunities to add
- Flags 5 holdings to review/exit
- Overall portfolio sentiment score
- Execution time: ~5-8 seconds

---

### Use Case 2: New Investment Research
**Scenario**: Evaluating NVIDIA before purchase

**Request**:
```
GET /api/stock/NVDA/analysis?inPortfolio=false
```

**Outcome**:
- Current market sentiment (positive/negative/neutral)
- Analyst consensus (buy/hold/sell)
- Composite score and action recommendation
- No historical bias (fresh evaluation)

---

### Use Case 3: Position Review
**Scenario**: Checking Tesla holding bought at $650

**Request**:
```
GET /api/stock/TSLA/analysis?inPortfolio=true&buyPrice=650.00
```

**Outcome**:
- Actual gain/loss calculation
- Performance vs sentiment vs analysts
- Whether to add, hold, or reduce position
- Reasoning based on all three factors

---

## Troubleshooting

### Model Loading Issues
```
Error: Failed to load FinBERT model
Solution: Ensure internet connection, verify transformers==4.36.0 installed
```

### No Recommendations Generated
```
Error: Unable to generate recommendations
Causes: 
  - Invalid ticker symbols
  - Missing buy prices for portfolio mode
  - Network connectivity issues
```

### Slow Performance
```
Issue: Taking >30 seconds for 10 stocks
Solutions:
  - Check internet connection speed
  - Verify ThreadPoolExecutor is functioning
  - First run includes model loading (~3s overhead)
```

---

## License & Attribution

This recommendation system uses:
- **FinBERT**: Apache 2.0 License
- **yfinance**: Apache 2.0 License  
- **Transformers**: Apache 2.0 License
- **PyTorch**: BSD 3-Clause License

---

## Contact & Support

For questions, issues, or contributions:
- Review the code in `services/recommendation_service.py`
- Check API endpoint implementations in `app.py`
- Refer to this documentation for methodology details

---

**Last Updated**: February 3, 2026  
**Version**: 1.0  
**System Status**: Production Ready
