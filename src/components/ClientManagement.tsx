
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  taxNumber?: string;
  contact1Name: string;
  contact1Phone: string;
  contact1Email: string;
  contact2Name?: string;
  contact2Phone?: string;
  contact2Email?: string;
  address?: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "TechCorp Solutions",
      taxNumber: "123456789",
      contact1Name: "João Silva",
      contact1Phone: "912345678",
      contact1Email: "joao@techcorp.pt",
      contact2Name: "Maria Santos",
      contact2Phone: "913456789",
      contact2Email: "maria@techcorp.pt",
      address: "Rua da Tecnologia, 123, Lisboa"
    },
    {
      id: "2",
      name: "InnovaTech",
      taxNumber: "987654321",
      contact1Name: "Pedro Costa",
      contact1Phone: "914567890",
      contact1Email: "pedro@innovatech.pt",
      address: "Av. da Inovação, 456, Porto"
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    taxNumber: "",
    contact1Name: "",
    contact1Phone: "",
    contact1Email: "",
    contact2Name: "",
    contact2Phone: "",
    contact2Email: "",
    address: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      taxNumber: "",
      contact1Name: "",
      contact1Phone: "",
      contact1Email: "",
      contact2Name: "",
      contact2Phone: "",
      contact2Email: "",
      address: ""
    });
    setEditingClient(null);
    setIsCreating(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.contact1Name || !formData.contact1Phone || !formData.contact1Email) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    const clientData: Client = {
      id: editingClient?.id || Date.now().toString(),
      name: formData.name,
      taxNumber: formData.taxNumber || undefined,
      contact1Name: formData.contact1Name,
      contact1Phone: formData.contact1Phone,
      contact1Email: formData.contact1Email,
      contact2Name: formData.contact2Name || undefined,
      contact2Phone: formData.contact2Phone || undefined,
      contact2Email: formData.contact2Email || undefined,
      address: formData.address || undefined
    };

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? clientData : c));
      toast.success("Cliente atualizado com sucesso!");
    } else {
      setClients(prev => [...prev, clientData]);
      toast.success("Cliente criado com sucesso!");
    }

    resetForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      taxNumber: client.taxNumber || "",
      contact1Name: client.contact1Name,
      contact1Phone: client.contact1Phone,
      contact1Email: client.contact1Email,
      contact2Name: client.contact2Name || "",
      contact2Phone: client.contact2Phone || "",
      contact2Email: client.contact2Email || "",
      address: client.address || ""
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success("Cliente eliminado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Gestão de Clientes
              </CardTitle>
              <CardDescription>
                Gerir informações de clientes e contactos
              </CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </h3>
              <div className="space-y-6">
                {/* Dados do Cliente */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Dados do Cliente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Nome do Cliente *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxNumber">Contribuinte</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber}
                        onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Morada</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Rua, número, cidade"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto Principal */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Contacto Principal *</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contact1Name">Nome *</Label>
                      <Input
                        id="contact1Name"
                        value={formData.contact1Name}
                        onChange={(e) => handleInputChange("contact1Name", e.target.value)}
                        placeholder="Nome do contacto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact1Phone">Telemóvel *</Label>
                      <Input
                        id="contact1Phone"
                        value={formData.contact1Phone}
                        onChange={(e) => handleInputChange("contact1Phone", e.target.value)}
                        placeholder="912345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact1Email">Email *</Label>
                      <Input
                        id="contact1Email"
                        type="email"
                        value={formData.contact1Email}
                        onChange={(e) => handleInputChange("contact1Email", e.target.value)}
                        placeholder="email@empresa.pt"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto Secundário */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Contacto Secundário (Opcional)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contact2Name">Nome</Label>
                      <Input
                        id="contact2Name"
                        value={formData.contact2Name}
                        onChange={(e) => handleInputChange("contact2Name", e.target.value)}
                        placeholder="Nome do contacto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact2Phone">Telemóvel</Label>
                      <Input
                        id="contact2Phone"
                        value={formData.contact2Phone}
                        onChange={(e) => handleInputChange("contact2Phone", e.target.value)}
                        placeholder="913456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact2Email">Email</Label>
                      <Input
                        id="contact2Email"
                        type="email"
                        value={formData.contact2Email}
                        onChange={(e) => handleInputChange("contact2Email", e.target.value)}
                        placeholder="email2@empresa.pt"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  {editingClient ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contribuinte</TableHead>
                <TableHead>Contacto Principal</TableHead>
                <TableHead>Contacto Secundário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      {client.address && (
                        <div className="text-sm text-gray-500">{client.address}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{client.taxNumber || "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{client.contact1Name}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {client.contact1Phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {client.contact1Email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.contact2Name ? (
                      <div className="space-y-1">
                        <div className="font-medium">{client.contact2Name}</div>
                        {client.contact2Phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {client.contact2Phone}
                          </div>
                        )}
                        {client.contact2Email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {client.contact2Email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
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

export default ClientManagement;
