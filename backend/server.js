const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/employee_db').then(() => console.log('MongoDB connected')).catch(console.error)

const employeeSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  city: String,
  salary: String,
  department: String,
  status: String,
  phone: String
})
const Employee = mongoose.model('Employee', employeeSchema)

app.post('/api/employees', async (req, res) => {
  try {
    const { username, password } = req.body
    if (username !== 'test' || password !== '123456') return res.status(401).json({ error: 'Auth failed' })
    
    let employees = await Employee.find({})
    if (employees.length === 0) {
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad']
      const depts = ['Engineering', 'HR', 'Finance', 'Sales', 'Marketing']
      const mock = Array.from({ length: 500 }, (_, i) => ({
        id: String(i + 1),
        name: `Employee ${i + 1}`,
        email: `emp${i + 1}@company.com`,
        city: cities[i % 6],
        salary: String(30000 + i * 100),
        department: depts[i % 5],
        status: i % 3 === 0 ? 'Inactive' : 'Active',
        phone: `+91 9${String(i).padStart(9,'0')}`
      }))
      await Employee.insertMany(mock)
      employees = await Employee.find({})
    }
    res.json(employees)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(5000, () => console.log('Server running on 5000'))
