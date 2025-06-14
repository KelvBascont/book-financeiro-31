import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { Auth } from '@/pages/auth';
import { Dashboard } from '@/pages/dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { CashExpenses } from '@/pages/cash-expenses';
import { Income } from '@/pages/income';
import { Cards } from '@/pages/cards';
import { Investments } from '@/pages/investments';
import { Savings } from '@/pages/savings';
import { Vehicles } from '@/pages/vehicles';
import { FinancialSpreadsheet } from '@/pages/spreadsheet';
import { NotFound } from '@/pages/not-found';
import { QueryClient } from 'react-query';
import { FinancialProvider } from '@/contexts/FinancialContext';
import Categories from '@/components/Categories';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <QueryClient>
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
          </QueryClient>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
