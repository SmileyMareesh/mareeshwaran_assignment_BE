const express = require('express')
const app = express()
const port = 3001

const data = [
    { "date": "2024-03-03", "amount": 90 },
    { "date": "2024-03-15", "amount": 130 },
    { "date": "2024-03-22", "amount": 70 },
    { "date": "2024-03-28", "amount": 180 },
    { "date": "2024-04-04", "amount": 160 },
    { "date": "2024-04-07", "amount": 110 },
    { "date": "2024-04-09", "amount": 30 },
    { "date": "2024-04-12", "amount": 80 },
    { "date": "2024-04-14", "amount": 160 },
    { "date": "2024-04-07", "amount": 110 },
    { "date": "2024-04-21", "amount": 100 },
    { "date": "2024-04-29", "amount": 220 },
    { "date": "2024-05-01", "amount": 30 },
    { "date": "2024-05-05", "amount": 140 },
    { "date": "2024-05-07", "amount": 70 },
    { "date": "2024-05-12", "amount": 190 },
    { "date": "2024-05-18", "amount": 40 },
    { "date": "2024-05-20", "amount": 130 },
    { "date": "2024-05-05", "amount": 110 },
    { "date": "2024-05-28", "amount": 240 },
    { "date": "2024-05-29", "amount": 10 },
    { "date": "2024-05-30", "amount": 120 },
    { "date": "2024-06-01", "amount": 120 },
    { "date": "2024-06-01", "amount": 150 },
    { "date": "2024-06-02", "amount": 80 },
    { "date": "2024-06-03", "amount": 200 },
]

 const calculateRewards = (amount) => {
    if (amount > 100) {
      return 2 * (amount - 100) + 50; // 2 points for every dollar over $100 + 1 point for every dollar between $50 and $100
    } else if (amount > 50) {
      return amount - 50; // 1 point for every dollar between $50 and $100
    }
    return 0; // No points for amounts less than $50
  };

  const getFilteredData = (data, sort = "All") => {
        const threeMonthsAgo = new Date()
        const now = new Date()
        threeMonthsAgo.setMonth(now.getMonth() - 2)
        const filteredData = data.filter((amount) => {
            const date = new Date(amount.date)
            return date >= threeMonthsAgo
        })
        if(sort === "All"){
            return filteredData
        }
        else{
           return filteredData.filter((x) => x.date.includes(sort))
        }
}

  const calculateTotalRewards = (data, sort = 'All', filterCurrentMonth = false) => {
    const monthlyRewards = {}
    let totalRewards = 0
    let currentMonthRewards = 0
    const currentMonth = new Date().toISOString().substring(0, 7)
    const filteredData = getFilteredData(data)
    filteredData.forEach(transaction => {
        const month = transaction.date.substring(0, 7)
        const rewards = calculateRewards(transaction.amount)
        if(!monthlyRewards[month]){
            monthlyRewards[month] = 0
        }
        monthlyRewards[month] += rewards
        totalRewards += rewards

        if(filterCurrentMonth && sort === 'All' ?  month === currentMonth : month === sort){
            currentMonthRewards += rewards 
        }
    });
    return {monthlyRewards, totalRewards, currentMonthRewards};
  }
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

app.get('/api/home', (req, res) => {
    let response = {}
    const {sort} = req.query
    response.transaction = getFilteredData(data, sort).reverse()
    response.rewards = calculateTotalRewards(data, sort, true)
    res.send(response)
})

app.get('/', (req, res) => {
    res.send("Server is up and running")
})

app.listen(port, () => {
    console.log(`server is running in port: ${port}`)
})