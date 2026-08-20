import { HashRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import CalculatorPage from './pages/Calculator'
import Invoices from './pages/Invoices'
import Clients from './pages/Clients'
import Suppliers from './pages/Suppliers'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import JournalEntries from './pages/JournalEntries'
import Tasks from './pages/Tasks'
import NumberToWordsPage from './pages/NumberToWords'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/journal" element={<JournalEntries />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/number-to-words" element={<NumberToWordsPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </SettingsProvider>
  )
}
