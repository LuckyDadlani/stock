document.addEventListener('DOMContentLoaded', () => {
    const ALPHA_VANTAGE_API_KEY = 'RC8L94IHH9CWILQA';
    const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

    // Function to fetch real-time price
    async function getRealTimePrice(symbol) {
        try {
            const response = await fetch(`${ALPHA_VANTAGE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`);
            const data = await response.json();
            const lastRefreshed = data['Meta Data']['3. Last Refreshed'];
            const currentPrice = parseFloat(data['Time Series (5min)'][lastRefreshed]['1. open']);
            return currentPrice;
        } catch (error) {
            console.error("Error fetching data for symbol:", symbol);
            return null;
        }
    }

    // Function to calculate Compound Annual Growth Rate (CAGR)
    function calculateCAGR(initialValue, finalValue, years) {
        return Math.pow(finalValue / initialValue, 1 / years) - 1;
    }

    const portfolio = {
        stocks: {},

        // Method to add a stock to the portfolio
        addStock: function(symbol, quantity, purchasePrice, purchaseDate, sector) {
            this.stocks[symbol] = {
                quantity,
                purchasePrice,
                purchaseDate,
                sector
            };
        },

        // Method to display the portfolio
        displayPortfolio: async function() {
            const table = document.createElement('table');
            table.innerHTML = `
                <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Purchase Date</th>
                    <th>Sector</th>
                    <th>Current Price</th>
                    <th>Current Value</th>
                    <th>CAGR</th>
                </tr>
            `;
            for (const symbol in this.stocks) {
                const details = this.stocks[symbol];
                const currentPrice = await getRealTimePrice(symbol);
                if (currentPrice !== null) {
                    const row = document.createElement('tr');
                    const quantity = details.quantity;
                    const purchasePrice = details.purchasePrice;
                    const purchaseDate = details.purchaseDate;
                    const sector = details.sector;
                    const currentValue = quantity * currentPrice;
                    const purchaseDateObj = new Date(purchaseDate);
                    const years = (new Date() - purchaseDateObj) / (365.25 * 24 * 60 * 60 * 1000);
                    const cagr = years > 0 ? calculateCAGR(purchasePrice, currentPrice, years) : 0;
                    row.innerHTML = `
                        <td>${symbol}</td>
                        <td>${quantity}</td>
                        <td>${purchasePrice}</td>
                        <td>${purchaseDate}</td>
                        <td>${sector}</td>
                        <td>${currentPrice}</td>
                        <td>${currentValue}</td>
                        <td>${(cagr * 100).toFixed(2)}%</td>
                    `;
                    table.appendChild(row);
                }
            }
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            outputDiv.appendChild(table);
        }
    };

    // Add button functionality
    document.getElementById('addStockBtn').addEventListener('click', async () => {
        const symbol = prompt("Enter the stock symbol:");
        const quantity = parseInt(prompt("Enter the quantity:"));
        const purchasePrice = parseFloat(prompt("Enter the purchase price:"));
        const purchaseDate = prompt("Enter the purchase date (YYYY-MM-DD):");
        const sector = prompt("Enter the sector:");

        if (symbol && !isNaN(quantity) && !isNaN(purchasePrice) && purchaseDate && sector) {
            portfolio.addStock(symbol, quantity, purchasePrice, purchaseDate, sector);
            console.log(`Stock ${symbol} added successfully.`);
            portfolio.displayPortfolio(); // Update the displayed portfolio after adding the new stock
        } else {
            console.error("Invalid input. Please provide valid data for all fields.");
        }
    });

    // Display initial portfolio
    portfolio.displayPortfolio();
});
