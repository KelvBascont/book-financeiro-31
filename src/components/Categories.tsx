
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { useSubcategories } from '@/hooks/useSubcategories';
import { useCategoryReports } from '@/hooks/useCategoryReports';
import { Plus, Edit2, Trash2, Tag, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CategoryForm from '@/components/categories/CategoryForm';
import SubcategoryForm from '@/components/categories/SubcategoryForm';
import CategoryReports from '@/components/categories/CategoryReports';

const Categories = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories' | 'reports'>('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const { 
    categories, 
    loading: categoriesLoading, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    expenseCategories,
    incomeCategories 
  } = useCategories();

  const {
    subcategories,
    loading: subcategoriesLoading,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  } = useSubcategories();

  const { reportData, loading: reportsLoading } = useCategoryReports();

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    setShowSubcategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      await deleteCategory(categoryId);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.')) {
      await deleteSubcategory(subcategoryId);
    }
  };

  const resetForms = () => {
    setShowCategoryForm(false);
    setShowSubcategoryForm(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
  };

  if (categoriesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sistema de Categorias
        </h1>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Categorias
          </Button>
          <Button
            variant={activeTab === 'subcategories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('subcategories')}
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Subcategorias
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gerenciar Categorias</h2>
            <Button
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          <CategoryForm
            isVisible={showCategoryForm}
            isEditing={!!editingCategory}
            editingCategory={editingCategory}
            onSubmit={editingCategory ? updateCategory : addCategory}
            onCancel={resetForms}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Categorias de Despesas ({expenseCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {category.name}
                      </Badge>
                      {category.is_system && (
                        <Badge variant="outline" className="text-xs">Sistema</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!category.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Income Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Categorias de Receitas ({incomeCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {category.name}
                      </Badge>
                      {category.is_system && (
                        <Badge variant="outline" className="text-xs">Sistema</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!category.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Subcategories Tab */}
      {activeTab === 'subcategories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gerenciar Subcategorias</h2>
            <Button
              onClick={() => setShowSubcategoryForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Subcategoria
            </Button>
          </div>

          <SubcategoryForm
            isVisible={showSubcategoryForm}
            isEditing={!!editingSubcategory}
            editingSubcategory={editingSubcategory}
            categories={categories}
            onSubmit={editingSubcategory ? updateSubcategory : addSubcategory}
            onCancel={resetForms}
          />

          <Card>
            <CardHeader>
              <CardTitle>Subcategorias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {subcategoriesLoading ? (
                <div className="text-center py-8">Carregando subcategorias...</div>
              ) : subcategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma subcategoria encontrada
                </div>
              ) : (
                <div className="space-y-3">
                  {subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {subcategory.name}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          → {categories.find(c => c.id === subcategory.category_id)?.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSubcategory(subcategory)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <CategoryReports 
          reportData={reportData} 
          loading={reportsLoading}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Categories;
