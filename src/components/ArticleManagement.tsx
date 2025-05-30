
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  name: string;
  description: string;
  group: "Serviços" | "Pack de horas" | "Marketing" | "Sites";
  pvp: number;
  marginPercent: number;
  marginEuro: number;
  costPrice: number;
  commission: number;
}

const ArticleManagement = () => {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      name: "Desenvolvimento Website",
      description: "Criação de website corporativo",
      group: "Sites",
      pvp: 2500,
      marginPercent: 60,
      marginEuro: 1500,
      costPrice: 1000,
      commission: 112.50
    },
    {
      id: "2",
      name: "Campanha Google Ads",
      description: "Gestão de campanha publicitária",
      group: "Marketing",
      pvp: 800,
      marginPercent: 50,
      marginEuro: 400,
      costPrice: 400,
      commission: 80
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    group: "",
    pvp: "",
    marginPercent: "",
    marginEuro: "",
    costPrice: ""
  });

  const commissionRates = {
    "Serviços": 0.05,
    "Pack de horas": 0.10,
    "Marketing": 0.20,
    "Sites": 0.075
  };

  const calculateValues = (field: string, value: string, currentData: any) => {
    const numValue = parseFloat(value) || 0;
    const pvp = field === "pvp" ? numValue : parseFloat(currentData.pvp) || 0;
    
    let marginPercent = 0;
    let marginEuro = 0;
    let costPrice = 0;

    if (field === "marginPercent") {
      marginPercent = numValue;
      marginEuro = (pvp * marginPercent) / 100;
      costPrice = pvp - marginEuro;
    } else if (field === "marginEuro") {
      marginEuro = numValue;
      marginPercent = pvp > 0 ? (marginEuro / pvp) * 100 : 0;
      costPrice = pvp - marginEuro;
    } else if (field === "costPrice") {
      costPrice = numValue;
      marginEuro = pvp - costPrice;
      marginPercent = pvp > 0 ? (marginEuro / pvp) * 100 : 0;
    } else if (field === "pvp") {
      const currentMarginPercent = parseFloat(currentData.marginPercent) || 0;
      marginPercent = currentMarginPercent;
      marginEuro = (pvp * marginPercent) / 100;
      costPrice = pvp - marginEuro;
    }

    return {
      marginPercent: marginPercent.toFixed(2),
      marginEuro: marginEuro.toFixed(2),
      costPrice: costPrice.toFixed(2)
    };
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "pvp" || field === "marginPercent" || field === "marginEuro" || field === "costPrice") {
      const calculated = calculateValues(field, value, formData);
      setFormData(prev => ({
        ...prev,
        [field]: value,
        ...calculated
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      group: "",
      pvp: "",
      marginPercent: "",
      marginEuro: "",
      costPrice: ""
    });
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.group || !formData.pvp) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    const group = formData.group as keyof typeof commissionRates;
    const marginEuro = parseFloat(formData.marginEuro) || 0;
    const commission = marginEuro * commissionRates[group];

    const articleData: Article = {
      id: editingArticle?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      group: group,
      pvp: parseFloat(formData.pvp),
      marginPercent: parseFloat(formData.marginPercent) || 0,
      marginEuro: marginEuro,
      costPrice: parseFloat(formData.costPrice) || 0,
      commission: commission
    };

    if (editingArticle) {
      setArticles(prev => prev.map(a => a.id === editingArticle.id ? articleData : a));
      toast.success("Artigo atualizado com sucesso!");
    } else {
      setArticles(prev => [...prev, articleData]);
      toast.success("Artigo criado com sucesso!");
    }

    resetForm();
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      name: article.name,
      description: article.description,
      group: article.group,
      pvp: article.pvp.toString(),
      marginPercent: article.marginPercent.toString(),
      marginEuro: article.marginEuro.toString(),
      costPrice: article.costPrice.toString()
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    toast.success("Artigo eliminado com sucesso!");
  };

  const getGroupColor = (group: string) => {
    const colors = {
      "Serviços": "bg-blue-100 text-blue-800",
      "Pack de horas": "bg-green-100 text-green-800",
      "Marketing": "bg-purple-100 text-purple-800",
      "Sites": "bg-orange-100 text-orange-800"
    };
    return colors[group as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Gestão de Artigos
              </CardTitle>
              <CardDescription>
                Gerir artigos com cálculos automáticos de margens e comissões
              </CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Artigo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingArticle ? "Editar Artigo" : "Novo Artigo"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nome do artigo"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descrição do artigo"
                  />
                </div>
                <div>
                  <Label htmlFor="group">Grupo *</Label>
                  <Select value={formData.group} onValueChange={(value) => handleInputChange("group", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Serviços">Serviços (5%)</SelectItem>
                      <SelectItem value="Pack de horas">Pack de horas (10%)</SelectItem>
                      <SelectItem value="Marketing">Marketing (20%)</SelectItem>
                      <SelectItem value="Sites">Sites (7.5%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pvp">PVP (€) *</Label>
                  <Input
                    id="pvp"
                    type="number"
                    step="0.01"
                    value={formData.pvp}
                    onChange={(e) => handleInputChange("pvp", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="marginPercent">Margem %</Label>
                  <Input
                    id="marginPercent"
                    type="number"
                    step="0.01"
                    value={formData.marginPercent}
                    onChange={(e) => handleInputChange("marginPercent", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="marginEuro">Margem €</Label>
                  <Input
                    id="marginEuro"
                    type="number"
                    step="0.01"
                    value={formData.marginEuro}
                    onChange={(e) => handleInputChange("marginEuro", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="costPrice">Preço de Custo (calculado)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange("costPrice", e.target.value)}
                    placeholder="0.00"
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  {editingArticle ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>PVP</TableHead>
                <TableHead>Margem %</TableHead>
                <TableHead>Margem €</TableHead>
                <TableHead>Preço Custo</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{article.name}</div>
                      <div className="text-sm text-gray-500">{article.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getGroupColor(article.group)}>
                      {article.group}
                    </Badge>
                  </TableCell>
                  <TableCell>€{article.pvp.toFixed(2)}</TableCell>
                  <TableCell>{article.marginPercent.toFixed(2)}%</TableCell>
                  <TableCell>€{article.marginEuro.toFixed(2)}</TableCell>
                  <TableCell>€{article.costPrice.toFixed(2)}</TableCell>
                  <TableCell>€{article.commission.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleManagement;
