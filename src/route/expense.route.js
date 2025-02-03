const { verify_token } = require('../controller/auth.controller');
const {getExpensesByUser,createExpense,deleteExpense, editExpense, getMonthlyExpenses}=require('../controller/expenseController');

module.exports =(app)=>{

app.get('/api/expenses/:userid',verify_token(),getExpensesByUser);
// app.get('/api/expenses/totalMonth/:userid',verify_token(),getMonthlyExpenses)
app.post('/api/expenses/create',verify_token(),createExpense);
app.put('/api/expenses/edit',verify_token(),editExpense)
app.delete('/api/expenses/:id',verify_token(),deleteExpense);
}