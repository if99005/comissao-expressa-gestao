
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { ProposalLine, Article } from "@/types/proposal";
import { useArticles } from "@/hooks/useProposalData";
import { calculateLineFromPVP, calculateLineFromCost } from "@/utils/proposalCalculations";

interface ProposalLinesTableProps {
  proposalLines: ProposalLine[];
  setProposalLines: (lines: ProposalLine[]) => void;
  onTotalsChange: (lines: ProposalLine[]) => void;
}

export const ProposalLinesTable = ({ proposalLines, setProposalLines, onTotalsChange }: ProposalLinesTableProps) => {
  const { data: articles = [] } = useArticles();

  const addProposalLine = () => {
    const newLines = [...proposalLines, {
      description: '',
      unit: 'un',
      quantity: 1,
      unit_price: 0,
      cost_price: 0,
      discount_percentage: 0,
      line_total: 0,
      calculation_mode: 'pvp' as const,
      margin_percentage: 0,
      margin_euro: 0
    }];
    setProposalLines(newLines);
  };

  const updateProposalLine = (index: number, field: keyof ProposalLine, value: any) => {
    const newLines = [...proposalLines];
    const line = newLines[index];
    
    // Update the field
    newLines[index] = { ...line, [field]: value };
    
    // Recalculate prices based on calculation mode
    if (field === 'calculation_mode') {
      // Reset values when changing calculation mode
      newLines[index] = {
        ...newLines[index],
        unit_price: 0,
        cost_price: 0,
        margin_percentage: 0,
        margin_euro: 0
      };
    } else if (line.calculation_mode === 'pvp') {
      // Calculate from PVP
      if (field === 'unit_price' || field === 'margin_percentage') {
        const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : line.unit_price;
        const marginPercent = field === 'margin_percentage' ? parseFloat(value) || 0 : line.margin_percentage;
        
        if (unitPrice > 0 && marginPercent > 0) {
          const { marginEuro, costPrice } = calculateLineFromPVP(unitPrice, marginPercent);
          newLines[index] = {
            ...newLines[index],
            margin_euro: marginEuro,
            cost_price: costPrice
          };
        }
      }
    } else if (line.calculation_mode === 'cost') {
      // Calculate from cost price
      if (field === 'cost_price' || field === 'margin_percentage' || field === 'margin_euro') {
        const costPrice = field === 'cost_price' ? parseFloat(value) || 0 : line.cost_price;
        
        if (costPrice > 0) {
          if (field === 'margin_percentage') {
            const marginPercent = parseFloat(value) || 0;
            const { marginEuro, unitPrice } = calculateLineFromCost(costPrice, marginPercent, true);
            newLines[index] = {
              ...newLines[index],
              margin_euro: marginEuro,
              unit_price: unitPrice
            };
          } else if (field === 'margin_euro') {
            const marginEuro = parseFloat(value) || 0;
            const { marginPercent, unitPrice } = calculateLineFromCost(costPrice, marginEuro, false);
            newLines[index] = {
              ...newLines[index],
              margin_percentage: marginPercent,
              unit_price: unitPrice
            };
          }
        }
      }
    }
    
    // Recalculate line total
    const updatedLine = newLines[index];
    const subtotal = updatedLine.quantity * updatedLine.unit_price;
    const discountAmount = subtotal * (updatedLine.discount_percentage / 100);
    updatedLine.line_total = subtotal - discountAmount;
    
    setProposalLines(newLines);
    onTotalsChange(newLines);
  };

  const removeProposalLine = (index: number) => {
    const newLines = proposalLines.filter((_, i) => i !== index);
    setProposalLines(newLines);
    onTotalsChange(newLines);
  };

  const selectArticle = (index: number, articleId: string) => {
    if (articleId === "manual") {
      // Reset to manual entry
      const newLines = [...proposalLines];
      newLines[index] = {
        ...newLines[index],
        article_id: null,
        description: '',
        unit: 'un',
        unit_price: 0,
        cost_price: 0,
        margin_euro: 0,
        margin_percentage: 0
      };
      setProposalLines(newLines);
      onTotalsChange(newLines);
      return;
    }

    const article = articles.find(a => a.id === articleId);
    if (article) {
      console.log('Selected article:', article);
      
      const newLines = [...proposalLines];
      
      // Calculate margin from article prices
      const marginEuro = article.sale_price - article.purchase_price;
      const marginPercent = article.purchase_price > 0 ? (marginEuro / article.purchase_price) * 100 : 0;
      
      // Update all fields at once
      newLines[index] = {
        ...newLines[index],
        article_id: articleId,
        description: article.description,
        unit: article.unit,
        unit_price: article.sale_price,
        cost_price: article.purchase_price,
        margin_euro: marginEuro,
        margin_percentage: marginPercent
      };
      
      // Recalculate line total
      const updatedLine = newLines[index];
      const subtotal = updatedLine.quantity * updatedLine.unit_price;
      const discountAmount = subtotal * (updatedLine.discount_percentage / 100);
      updatedLine.line_total = subtotal - discountAmount;
      
      console.log('Updated line:', updatedLine);
      
      setProposalLines(newLines);
      onTotalsChange(newLines);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Artigos</h3>
        <Button type="button" onClick={addProposalLine} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Linha
        </Button>
      </div>

      {proposalLines.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artigo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Unid.</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Modo Cálculo</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Preço Custo</TableHead>
                <TableHead>Margem %</TableHead>
                <TableHead>Margem €</TableHead>
                <TableHead>Desc. %</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposalLines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={line.article_id || "manual"}
                      onValueChange={(value) => selectArticle(index, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Manual" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.reference}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={line.description}
                      onChange={(e) => updateProposalLine(index, 'description', e.target.value)}
                      placeholder="Descrição"
                      className="w-40"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={line.unit}
                      onChange={(e) => updateProposalLine(index, 'unit', e.target.value)}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      value={line.quantity}
                      onChange={(e) => updateProposalLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={line.calculation_mode}
                      onValueChange={(value: 'pvp' | 'cost') => updateProposalLine(index, 'calculation_mode', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pvp">PVP</SelectItem>
                        <SelectItem value="cost">Custo</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateProposalLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-24"
                      readOnly={line.calculation_mode === 'cost'}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.cost_price}
                      onChange={(e) => updateProposalLine(index, 'cost_price', parseFloat(e.target.value) || 0)}
                      className="w-24"
                      readOnly={line.calculation_mode === 'pvp'}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.margin_percentage}
                      onChange={(e) => updateProposalLine(index, 'margin_percentage', parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.margin_euro}
                      onChange={(e) => updateProposalLine(index, 'margin_euro', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      readOnly={line.calculation_mode === 'pvp'}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.discount_percentage}
                      onChange={(e) => updateProposalLine(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    €{line.line_total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProposalLine(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
