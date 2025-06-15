import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import Auth from '@/pages/Auth';
import Dashboard from '@/components/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import CashExpenses from '@/components/CashExpenses';
import Income from '@/components/Income';
import Cards from '@/components/Cards';
import Investments from '@/components/Investments';
import Savings from '@/components/Savings';
import Vehicles from '@/components/Vehicles';
import FinancialSpreadsheet from '@/components/FinancialSpreadsheet';
import NotFound from '@/pages/NotFound';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinancialProvider } from '@/contexts/FinancialContext';
import Categories from '@/components/Categories';
import MonthlyBudgets from '@/components/MonthlyBudgets';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <FinancialProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Dashboard />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/cash-expenses" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <CashExpenses />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/income" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Income />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/cards" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Cards />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/categories" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Categories />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/budgets" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <MonthlyBudgets />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/investments" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Investments />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/savings" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Savings />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/vehicles" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <Vehicles />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/spreadsheet" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Navigation />
                        <main className="flex-1 overflow-auto">
                          <FinancialSpreadsheet />
                        </main>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </FinancialProvider>
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
