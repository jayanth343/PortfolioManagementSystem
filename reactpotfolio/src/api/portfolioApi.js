export const getPortfolioSummary = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        userName: 'Alex Johnson',
        portfolioValue: '$52,600.00',
        totalGain: '+$20,000.00',
        gainPercentage: '61.35%'
      });
    }, 500);
  });
};

export const getPortfolioPerformance = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { date: 'Jan', value: 30000 },
        { date: 'Feb', value: 35000 },
        { date: 'Mar', value: 32000 },
        { date: 'Apr', value: 40000 },
        { date: 'May', value: 45000 },
        { date: 'Jun', value: 52600 }
      ]);
    }, 600);
  });
};
