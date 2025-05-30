
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Edit, Trash2, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  orientation: "horizontal" | "vertical";
  backgroundType: "pdf" | "image";
  backgroundUrl?: string;
  fields: TemplateField[];
  createdDate: string;
}

interface TemplateField {
  id: string;
  label: string;
  type: "text" | "number" | "date";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontColor: string;
}

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Proposta Comercial A4",
      orientation: "vertical",
      backgroundType: "pdf",
      fields: [
        {
          id: "1",
          label: "Nome do Cliente",
          type: "text",
          x: 100,
          y: 150,
          width: 200,
          height: 30,
          fontSize: 14,
          fontColor: "#000000"
        },
        {
          id: "2",
          label: "Valor Total",
          type: "number",
          x: 400,
          y: 300,
          width: 150,
          height: 30,
          fontSize: 16,
          fontColor: "#0066cc"
        }
      ],
      createdDate: "2024-05-28"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    orientation: "",
    backgroundType: ""
  });

  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [fieldData, setFieldData] = useState({
    label: "",
    type: "text",
    x: "0",
    y: "0",
    width: "100",
    height: "30",
    fontSize: "12",
    fontColor: "#000000"
  });

  const resetForm = () => {
    setFormData({
      name: "",
      orientation: "vertical",
      backgroundType: "pdf"
    });
    setEditingTemplate(null);
  };

  const resetFieldForm = () => {
    setFieldData({
      label: "",
      type: "text",
      x: "0",
      y: "0",
      width: "100",
      height: "30",
      fontSize: "12",
      fontColor: "#000000"
    });
    setSelectedField(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldInputChange = (field: string, value: string) => {
    setFieldData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.orientation || !formData.backgroundType) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const templateData: Template = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      orientation: formData.orientation as Template["orientation"],
      backgroundType: formData.backgroundType as Template["backgroundType"],
      fields: editingTemplate?.fields || [],
      createdDate: editingTemplate?.createdDate || new Date().toISOString().split('T')[0]
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? templateData : t));
      toast.success("Template atualizado com sucesso!");
    } else {
      setTemplates(prev => [...prev, templateData]);
      toast.success("Template criado com sucesso!");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      orientation: template.orientation,
      backgroundType: template.backgroundType
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template eliminado com sucesso!");
  };

  const openEditor = (template: Template) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const addField = () => {
    if (!fieldData.label || !editingTemplate) return;

    const newField: TemplateField = {
      id: Date.now().toString(),
      label: fieldData.label,
      type: fieldData.type as TemplateField["type"],
      x: parseInt(fieldData.x),
      y: parseInt(fieldData.y),
      width: parseInt(fieldData.width),
      height: parseInt(fieldData.height),
      fontSize: parseInt(fieldData.fontSize),
      fontColor: fieldData.fontColor
    };

    const updatedTemplate = {
      ...editingTemplate,
      fields: [...editingTemplate.fields, newField]
    };

    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
    setEditingTemplate(updatedTemplate);
    resetFieldForm();
    toast.success("Campo adicionado com sucesso!");
  };

  const updateField = () => {
    if (!selectedField || !editingTemplate) return;

    const updatedField: TemplateField = {
      ...selectedField,
      label: fieldData.label,
      type: fieldData.type as TemplateField["type"],
      x: parseInt(fieldData.x),
      y: parseInt(fieldData.y),
      width: parseInt(fieldData.width),
      height: parseInt(fieldData.height),
      fontSize: parseInt(fieldData.fontSize),
      fontColor: fieldData.fontColor
    };

    const updatedTemplate = {
      ...editingTemplate,
      fields: editingTemplate.fields.map(f => f.id === selectedField.id ? updatedField : f)
    };

    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
    setEditingTemplate(updatedTemplate);
    resetFieldForm();
    toast.success("Campo atualizado com sucesso!");
  };

  const deleteField = (fieldId: string) => {
    if (!editingTemplate) return;

    const updatedTemplate = {
      ...editingTemplate,
      fields: editingTemplate.fields.filter(f => f.id !== fieldId)
    };

    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
    setEditingTemplate(updatedTemplate);
    toast.success("Campo removido com sucesso!");
  };

  const selectField = (field: TemplateField) => {
    setSelectedField(field);
    setFieldData({
      label: field.label,
      type: field.type,
      x: field.x.toString(),
      y: field.y.toString(),
      width: field.width.toString(),
      height: field.height.toString(),
      fontSize: field.fontSize.toString(),
      fontColor: field.fontColor
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload - numa implementação real, faria upload para servidor
      const fakeUrl = URL.createObjectURL(file);
      toast.success("Ficheiro carregado com sucesso!");
      console.log("File uploaded:", file.name, fakeUrl);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Templates de Impressão
              </CardTitle>
              <CardDescription>
                Criar e gerir templates personalizados para documentos
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? "Editar Template" : "Novo Template"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure as propriedades básicas do template.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name">Nome do Template *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Proposta Comercial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orientation">Orientação *</Label>
                    <Select value={formData.orientation} onValueChange={(value) => handleInputChange("orientation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar orientação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vertical">Vertical (Retrato)</SelectItem>
                        <SelectItem value="horizontal">Horizontal (Paisagem)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backgroundType">Tipo de Fundo *</Label>
                    <Select value={formData.backgroundType} onValueChange={(value) => handleInputChange("backgroundType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="image">Imagem (JPG)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backgroundFile">Ficheiro de Fundo</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="backgroundFile"
                        type="file"
                        accept={formData.backgroundType === "pdf" ? ".pdf" : ".jpg,.jpeg"}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("backgroundFile")?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Carregar Ficheiro
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
                    {editingTemplate ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-indigo-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {template.backgroundType === "pdf" ? (
                        <FileText className="w-5 h-5 text-red-600" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      )}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    {template.orientation === "vertical" ? "Vertical" : "Horizontal"} • {template.fields.length} campos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.fields.slice(0, 3).map((field) => (
                      <span key={field.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {field.label}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        +{template.fields.length - 3} mais
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(template.createdDate).toLocaleDateString('pt-PT')}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditor(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor de Template */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Editor de Template - {editingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Configure os campos do template arrastando e posicionando-os sobre o fundo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-full gap-6">
            {/* Painel de Controlo */}
            <div className="w-1/3 space-y-4 overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Adicionar Campo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="fieldLabel">Etiqueta</Label>
                    <Input
                      id="fieldLabel"
                      value={fieldData.label}
                      onChange={(e) => handleFieldInputChange("label", e.target.value)}
                      placeholder="Nome do campo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldType">Tipo</Label>
                    <Select value={fieldData.type} onValueChange={(value) => handleFieldInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="fieldX">X</Label>
                      <Input
                        id="fieldX"
                        type="number"
                        value={fieldData.x}
                        onChange={(e) => handleFieldInputChange("x", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldY">Y</Label>
                      <Input
                        id="fieldY"
                        type="number"
                        value={fieldData.y}
                        onChange={(e) => handleFieldInputChange("y", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="fieldWidth">Largura</Label>
                      <Input
                        id="fieldWidth"
                        type="number"
                        value={fieldData.width}
                        onChange={(e) => handleFieldInputChange("width", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldHeight">Altura</Label>
                      <Input
                        id="fieldHeight"
                        type="number"
                        value={fieldData.height}
                        onChange={(e) => handleFieldInputChange("height", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="fontSize">Tamanho Fonte</Label>
                      <Input
                        id="fontSize"
                        type="number"
                        value={fieldData.fontSize}
                        onChange={(e) => handleFieldInputChange("fontSize", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fontColor">Cor</Label>
                      <Input
                        id="fontColor"
                        type="color"
                        value={fieldData.fontColor}
                        onChange={(e) => handleFieldInputChange("fontColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedField ? (
                      <>
                        <Button onClick={updateField} size="sm" className="flex-1">
                          Atualizar
                        </Button>
                        <Button onClick={resetFieldForm} variant="outline" size="sm">
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button onClick={addField} size="sm" className="w-full">
                        Adicionar Campo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Campos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Campos Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {editingTemplate?.fields.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{field.label}</div>
                          <div className="text-xs text-gray-500">
                            {field.type} • {field.x},{field.y}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectField(field)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteField(field.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Área de Preview */}
            <div className="flex-1 border rounded-lg bg-gray-50 relative overflow-auto">
              <div className="p-4">
                <div className="text-center text-gray-500 mb-4">
                  Preview do Template ({editingTemplate?.orientation})
                </div>
                <div 
                  className={cn(
                    "bg-white border-2 border-dashed border-gray-300 relative mx-auto",
                    editingTemplate?.orientation === "vertical" ? "w-[595px] h-[842px]" : "w-[842px] h-[595px]"
                  )}
                  style={{ minHeight: editingTemplate?.orientation === "vertical" ? "842px" : "595px" }}
                >
                  {/* Renderizar campos */}
                  {editingTemplate?.fields.map((field) => (
                    <div
                      key={field.id}
                      className={cn(
                        "absolute border border-blue-300 bg-blue-50 cursor-pointer p-1",
                        selectedField?.id === field.id && "border-blue-500 bg-blue-100"
                      )}
                      style={{
                        left: `${field.x}px`,
                        top: `${field.y}px`,
                        width: `${field.width}px`,
                        height: `${field.height}px`,
                        fontSize: `${field.fontSize}px`,
                        color: field.fontColor
                      }}
                      onClick={() => selectField(field)}
                    >
                      {field.label}
                    </div>
                  ))}
                  
                  {/* Mensagem se não houver fundo */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4" />
                      <p>Carregue um ficheiro de fundo</p>
                      <p className="text-sm">para visualizar o template</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManagement;
