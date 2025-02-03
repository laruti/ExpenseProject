const db=require('../util/db')

const createExpense = (req, res) => {
  const { userId, amount, category, date, notes } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  db.run(
    `INSERT INTO expense (user_id, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)`,
    [userId, amount, category, date, notes],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding expense: ' + err.message });
      }
      res.status(201).json({ message: 'Expense added successfully.', id: this.lastID });
    }
  );
};

// getExpensesByUser
const getExpensesByUser = (req, res) => {
  const userid = req.params.userid; // Get user_id from request parameters

  // SQL query to fetch expenses for the given user_id
  db.all(
    `SELECT * FROM expense WHERE user_id = ? ORDER BY id DESC`,
    [userid],
    (err, rows) => {
      if (err) {
        console.error('Error fetching expenses:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: 'No expenses found for this user' });
      }

      // Return the list of expenses
      return res.status(200).json(rows);
    }
  );
};

// Edit an expense
const editExpense = (req, res) => {
  const { id, amount, category, date, notes } = req.body;

  if (!id) {
      return res.status(400).json({ message: 'Expense ID is required.' });
  }

  const sqlUpdate = `UPDATE expense SET amount = ?, category = ?, date = ?, notes = ? WHERE id = ?`;

  db.run(sqlUpdate, [amount, category, date, notes, id], function (err) {
      if (err) {
          return res.status(500).json({ message: 'Error updating expense: ' + err.message });
      }
      if (this.changes === 0) {
          return res.status(404).json({ message: 'Expense not found.' });
      }
      res.json({ message: 'Expense updated successfully.' });
  });
};



const deleteExpense = (req, res) => {
  const id = req.params.id; // Extract expense ID from route parameters

  if (!id) {
      return res.status(400).json({ message: 'Expense ID is required.' });
  }

  const sqlDelete = `DELETE FROM expense WHERE id = ?`;

  db.run(sqlDelete, [id], function (err) {
      if (err) {
          return res.status(500).json({ message: 'Error deleting expense: ' + err.message });
      }
      if (this.changes === 0) {
          return res.status(404).json({ message: 'Expense not found.' });
      }
      res.json({ message: 'Expense deleted successfully.' });
  });
};


// const getMonthlyExpenses = (req, res) => {
//   const userid = req.params.userid;  // Assuming user_id is passed as a URL parameter

//   // Validate user_id
//   if (!userid) {
//     return res.status(400).json({ error: 'User ID is required.' });
//   }

//   const query = `
//     SELECT 
//       strftime('%Y-%m', date) AS month, 
//       SUM(amount) AS total_amount
//     FROM 
//       expense
//     WHERE 
//       user_id = ?
//     GROUP BY 
//       month
//     ORDER BY 
//       month;
//   `;

//   db.all(query, [userid], (err, rows) => {
//     if (err) {
//       console.error('Error fetching monthly expenses:', err.message);
//       return res.status(500).json({ error: 'An error occurred while fetching monthly expenses.' });
//     }
//     res.status(200).json(rows);
//   });
// };


module.exports={
  // getMonthlyExpenses,
    createExpense,
    getExpensesByUser,
    deleteExpense,
    editExpense
}

