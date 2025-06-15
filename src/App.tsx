
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import Auth from '@/pages/Auth';
import Dashboard from '@/components/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppSidebar from '@/components/AppSidebar';
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
import Bills from '@/components/Bills';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/Header';

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
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Dashboard />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/cash-expenses" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <CashExpenses />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/income" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Income />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/cards" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Cards />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/categories" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Categories />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/budgets" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <MonthlyBudgets />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/bills" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Bills />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/investments" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Investments />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/savings" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Savings />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/vehicles" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <Vehicles />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/spreadsheet" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full">
                          <AppSidebar />
                          <SidebarInset>
                            <Header />
                            <main className="flex-1 overflow-auto p-4">
                              <FinancialSpreadsheet />
                            </main>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
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
