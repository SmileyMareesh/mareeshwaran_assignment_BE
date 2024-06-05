const express = require('express')
const app = express()
const port = 3001
const {data, users} =  require("./data")

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

  const calculateUserRewards = (id) => {
    const userDetails = data.filter((x) => x.userID === id)
    return calculateTotalRewards(userDetails[0].transaction, 'All', true)
  }

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

app.get('/api/getDetails/:id', (req, res) => {
    let response = {}
    const {sort} = req.query
    const {id} = req.params
    const filteredData = data.filter((x) => x.userID === id)[0].transaction
    response.transaction = getFilteredData(filteredData, sort).reverse()
    response.rewards = calculateTotalRewards(filteredData, sort, true)
    res.send(response)
})

app.get('/api/users', (req, res) => {
  let response  = []
  users.map((user) => {
    let temp = user
    temp['totalRewards'] = calculateUserRewards(user.userID).totalRewards
    response.push(temp)
  })
  res.send(response)
})

app.get('/', (req, res) => {
    res.send("Server is up and running")
})

app.listen(port, () => {
    console.log(`server is running in port: ${port}`)
})