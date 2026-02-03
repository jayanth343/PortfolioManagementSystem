import { getAssets } from './assetsApi.js';

export const getPortfolioSummary = async () => {
  const assets = await getAssets();

  let totalPortfolioValue = 0;
  let totalInvestedValue = 0;

  assets.forEach(asset => {
    const currentValue = asset.currentValue;
    const percentageChange = asset.percentageChange;

    totalPortfolioValue += currentValue;

    const gainFactor = 1 + (percentageChange / 100);
    if (gainFactor !== 0) {
      totalInvestedValue += currentValue / gainFactor;
    }
  });

  const totalGainValue = totalPortfolioValue - totalInvestedValue;
  const gainPercentageValue = totalInvestedValue > 0 ? (totalGainValue / totalInvestedValue) * 100 : 0;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        userName: 'Alex Johnson',
        portfolioValue: totalPortfolioValue,
        totalGain: totalGainValue,
        gainPercentage: gainPercentageValue
      });
    }, 500);
  });
};

export const getPortfolioPerformance = async () => {
  // We want the chart to end at the current portfolio value.
  const summary = await getPortfolioSummary();
  const currentTotal = summary.portfolioValue;

  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate deterministic history
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = months.map((month, index) => {
        // Create a curve that ends at currentTotal
        // factor grows from 0.8 to 1.0 (approx)
        const factor = 0.8 + (index * 0.04) + (Math.sin(index) * 0.05);
        return {
          date: month,
          value: Math.round(currentTotal * factor)
        };
      });

      // Adjust last point to be exactly current
      data[data.length - 1].value = currentTotal;

      resolve(data);
    }, 600);
  });
};

export const getAssetAllocation = async () => {
  const assets = await getAssets();
  const allocation = {};

  assets.forEach(asset => {
    const value = asset.currentValue;
    if (allocation[asset.assetType]) {
      allocation[asset.assetType] += value;
    } else {
      allocation[asset.assetType] = value;
    }
  });

  return Object.keys(allocation).map(type => ({
    assetType: type,
    value: allocation[type]
  }));
};
