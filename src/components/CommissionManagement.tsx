
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Euro, DollarSign, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";

interface Commission {
  id: string;
  proposalId: string;
  proposalClient: string;
  commercial: string;
  totalValue: number;
  paidValue: number;
  pendingValue: number;
  status: "A pagar" | "Pago parcialmente" | "Pago";
  paymentDate?: string;
  notes?: string;
}

const CommissionManagement = () => {
  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: "1",
      proposalId: "1",
      proposalClient: "TechCorp Solutions",
      commercial: "João Silva",
      totalValue: 112.50,
      paidValue: 0,
      pendingValue: 112.50,
      status: "A pagar"
    },
    {
      id: "2",
      proposalId: "2",
      proposalClient: "InnovaTech",
      commercial: "Maria Santos",
      totalValue: 240,
      paidValue: 100,
      pendingValue: 140,
      status: "Pago parcialmente",
      paymentDate: "2024-05-25"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState({
    proposalId: "",
    commercial: "",
    paymentAmount: "",
    paymentDate: "",
    notes: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Mock data de propostas ganhas
  const wonProposals = [
    { id: "1", client: "TechCorp Solutions", totalCommission: 112.50 },
    { id: "2", client: "InnovaTech", totalCommission: 240 },
    { id: "3", client: "DigitalPro", totalCommission: 85 }
  ];

  // Mock data de comerciais
  const commercials = [
    "João Silva",
    "Maria Santos",
    "Pedro Costa",
    "Ana Rodrigues"
  ];

  const resetForm = () => {
    setFormData({
      proposalId: "",
      commercial: "",
      paymentAmount: "",
      paymentDate: "",
      notes: ""
    });
    setSelectedDate(undefined);
    setEditingCommission(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData(prev => ({ 
      ...prev, 
      paymentDate: date ? format(date, "yyyy-MM-dd") : "" 
    }));
  };

  const handleSubmit = () => {
    if (!formData.proposalId || !formData.commercial) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    const proposal = wonProposals.find(p => p.id === formData.proposalId);
    if (!proposal) return;

    const existingCommission = commissions.find(c => c.proposalId === formData.proposalId);
    
    if (existingCommission && !editingCommission) {
      toast.error("Já existe uma comissão para esta proposta!");
      return;
    }

    const commissionData: Commission = {
      id: editingCommission?.id || Date.now().toString(),
      proposalId: formData.proposalId,
      proposalClient: proposal.client,
      commercial: formData.commercial,
      totalValue: proposal.totalCommission,
      paidValue: editingCommission?.paidValue || 0,
      pendingValue: proposal.totalCommission - (editingCommission?.paidValue || 0),
      status: editingCommission?.status || "A pagar",
      paymentDate: editingCommission?.paymentDate,
      notes: formData.notes || undefined
    };

    if (editingCommission) {
      setCommissions(prev => prev.map(c => c.id === editingCommission.id ? commissionData : c));
      toast.success("Comissão atualizada com sucesso!");
    } else {
      setCommissions(prev => [...prev, commissionData]);
      toast.success("Comissão criada com sucesso!");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handlePayment = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      proposalId: commission.proposalId,
      commercial: commission.commercial,
      paymentAmount: "",
      paymentDate: "",
      notes: commission.notes || ""
    });
    setIsDialogOpen(true);
  };

  const processPayment = () => {
    if (!editingCommission || !formData.paymentAmount || !formData.paymentDate) {
      toast.error("Preencha o valor e data do pagamento!");
      return;
    }

    const paymentAmount = parseFloat(formData.paymentAmount);
    if (paymentAmount <= 0 || paymentAmount > editingCommission.pendingValue) {
      toast.error("Valor de pagamento inválido!");
      return;
    }

    const newPaidValue = editingCommission.paidValue + paymentAmount;
    const newPendingValue = editingCommission.totalValue - newPaidValue;
    
    let newStatus: Commission["status"] = "A pagar";
    if (newPendingValue === 0) {
      newStatus = "Pago";
    } else if (newPaidValue > 0) {
      newStatus = "Pago parcialmente";
    }

    const updatedCommission: Commission = {
      ...editingCommission,
      paidValue: newPaidValue,
      pendingValue: newPendingValue,
      status: newStatus,
      paymentDate: formData.paymentDate,
      notes: formData.notes || undefined
    };

    setCommissions(prev => prev.map(c => c.id === editingCommission.id ? updatedCommission : c));
    toast.success("Pagamento registado com sucesso!");
    
    setIsDialogOpen(false);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "A pagar": "bg-red-100 text-red-800",
      "Pago parcialmente": "bg-yellow-100 text-yellow-800",
      "Pago": "bg-green-100 text-green-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      "A pagar": <Clock className="w-4 h-4" />,
      "Pago parcialmente": <DollarSign className="w-4 h-4" />,
      "Pago": <CheckCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  // Calcular estatísticas
  const totalCommissions = commissions.reduce((sum, c) => sum + c.totalValue, 0);
  const totalPaid = commissions.reduce((sum, c) => sum + c.paidValue, 0);
  const totalPending = commissions.reduce((sum, c) => sum + c.pendingValue, 0);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{totalCommissions.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-purple-600" />
                Gestão de Comissões
              </CardTitle>
              <CardDescription>
                Controlar pagamentos de comissões por proposta
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Comissão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCommission ? "Registar Pagamento" : "Nova Comissão"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCommission ? "Registar pagamento de comissão" : "Criar nova comissão para proposta ganha"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {!editingCommission && (
                    <>
                      <div>
                        <Label htmlFor="proposalId">Proposta Ganha *</Label>
                        <Select value={formData.proposalId} onValueChange={(value) => handleInputChange("proposalId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar proposta" />
                          </SelectTrigger>
                          <SelectContent>
                            {wonProposals.map(proposal => (
                              <SelectItem key={proposal.id} value={proposal.id}>
                                {proposal.client} - €{proposal.totalCommission.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="commercial">Comercial *</Label>
                        <Select value={formData.commercial} onValueChange={(value) => handleInputChange("commercial", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar comercial" />
                          </SelectTrigger>
                          <SelectContent>
                            {commercials.map(commercial => (
                              <SelectItem key={commercial} value={commercial}>
                                {commercial}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {editingCommission && (
                    <>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Comissão: {editingCommission.proposalClient}</div>
                        <div className="text-sm text-gray-600">Comercial: {editingCommission.commercial}</div>
                        <div className="text-sm font-semibold">Total: €{editingCommission.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-green-600">Pago: €{editingCommission.paidValue.toFixed(2)}</div>
                        <div className="text-sm text-red-600">Pendente: €{editingCommission.pendingValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <Label htmlFor="paymentAmount">Valor do Pagamento *</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          step="0.01"
                          max={editingCommission.pendingValue}
                          value={formData.paymentAmount}
                          onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Data do Pagamento *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP", { locale: pt }) : "Selecionar data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Observações sobre o pagamento"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={editingCommission ? processPayment : handleSubmit} 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {editingCommission ? "Registar Pagamento" : "Criar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposta / Cliente</TableHead>
                <TableHead>Comercial</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Valor Pendente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{commission.proposalClient}</div>
                      <div className="text-sm text-gray-500">Proposta #{commission.proposalId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{commission.commercial}</TableCell>
                  <TableCell>€{commission.totalValue.toFixed(2)}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    €{commission.paidValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    €{commission.pendingValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(commission.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(commission.status)}
                        {commission.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {commission.paymentDate ? 
                      new Date(commission.paymentDate).toLocaleDateString('pt-PT') : 
                      "-"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {commission.status !== "Pago" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePayment(commission)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Pagar
                      </Button>
                    )}
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

export default CommissionManagement;
