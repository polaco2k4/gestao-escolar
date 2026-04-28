# 🎨 Sistema de Alertas Modernos - Guia Completo

## 📋 Visão Geral

Substituímos os alertas nativos do navegador (`alert()`, `confirm()`) por um sistema moderno e elegante com:

✨ **Design Moderno** - Interface limpa e profissional  
🎨 **4 Tipos de Alertas** - Info, Success, Warning, Error  
⌨️ **Atalhos de Teclado** - ESC para fechar  
📱 **Responsivo** - Funciona em desktop e mobile  
🎭 **Animações Suaves** - Transições elegantes  

---

## 🚀 Como Usar

### 1. Importar o Hook

```typescript
import { useAlert } from '../hooks/useAlert';
```

### 2. Inicializar no Componente

```typescript
export default function MeuComponente() {
  const { showAlert, showConfirm, showSuccess, showError, showWarning, showInfo, AlertComponent } = useAlert();
  
  // ... resto do código
  
  return (
    <div>
      {/* Seu conteúdo */}
      
      {/* IMPORTANTE: Adicionar no final do return */}
      {AlertComponent}
    </div>
  );
}
```

---

## 📚 Exemplos de Uso

### ✅ Alerta de Sucesso

```typescript
showSuccess('Sucesso!', 'Horário criado com sucesso!');
```

**Resultado:**
- ✅ Ícone verde de check
- Fundo verde claro
- Botão verde "OK"

---

### ❌ Alerta de Erro

```typescript
showError('Erro ao Salvar', 'Não foi possível salvar o horário. Tente novamente.');
```

**Resultado:**
- ❌ Ícone vermelho de erro
- Fundo vermelho claro
- Botão vermelho "OK"

---

### ⚠️ Alerta de Aviso

```typescript
showWarning('Atenção', 'O ano letivo está próximo do fim.');
```

**Resultado:**
- ⚠️ Ícone amarelo de aviso
- Fundo amarelo claro
- Botão amarelo "OK"

---

### ℹ️ Alerta de Informação

```typescript
showInfo('Informação', 'O sistema será atualizado amanhã.');
```

**Resultado:**
- ℹ️ Ícone azul de informação
- Fundo azul claro
- Botão azul "OK"

---

### 🔔 Alerta Personalizado

```typescript
showAlert({
  title: 'Título Personalizado',
  message: 'Mensagem personalizada aqui',
  type: 'warning',
  confirmText: 'Entendi'
});
```

---

### ❓ Confirmação (OK e Cancelar)

```typescript
showConfirm({
  title: 'Confirmar Exclusão',
  message: 'Tem certeza que deseja excluir este horário?\n\nEsta ação não pode ser desfeita.',
  type: 'error',
  confirmText: 'Sim, Excluir',
  cancelText: 'Não, Cancelar',
  onConfirm: () => {
    // Código executado ao clicar em "Sim, Excluir"
    deleteSchedule(id);
  }
});
```

**Resultado:**
- Dois botões: "Não, Cancelar" (cinza) e "Sim, Excluir" (vermelho)
- Ao clicar em "Sim, Excluir", executa a função `onConfirm`
- Ao clicar em "Não, Cancelar" ou ESC, apenas fecha

---

## 🎯 Casos de Uso Comuns

### Validação de Formulário

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.name) {
    showAlert({
      title: 'Campo Obrigatório',
      message: 'Por favor, preencha o nome.',
      type: 'warning'
    });
    return;
  }
  
  // Continuar com o submit...
};
```

---

### Confirmação de Exclusão

```typescript
const handleDelete = (item: any) => {
  showConfirm({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir "${item.name}"?\n\nEsta ação não pode ser desfeita.`,
    type: 'error',
    confirmText: 'Sim, Excluir',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        await deleteItem(item.id);
        showSuccess('Excluído!', 'Item excluído com sucesso.');
        loadData();
      } catch (error) {
        showError('Erro', 'Não foi possível excluir o item.');
      }
    }
  });
};
```

---

### Sucesso Após Operação

```typescript
try {
  await saveData(formData);
  showSuccess('Salvo!', 'Dados salvos com sucesso!');
  navigate('/lista');
} catch (error: any) {
  showError('Erro ao Salvar', error.message);
}
```

---

### Aviso com Múltiplas Linhas

```typescript
showWarning(
  'Ano Letivo Expirado',
  `ATENÇÃO: O ano letivo "2025-2026" já terminou.\n\n` +
  `Criar registros em um ano expirado pode causar problemas.\n\n` +
  `Por favor, ative o próximo ano letivo.`
);
```

**Nota:** Use `\n\n` para quebras de linha (parágrafos).

---

## 🎨 Tipos de Alertas

### 1. **Info** (Azul)
- Informações gerais
- Dicas
- Avisos neutros

### 2. **Success** (Verde)
- Operações concluídas com sucesso
- Confirmações positivas
- Feedback de sucesso

### 3. **Warning** (Amarelo)
- Avisos importantes
- Validações de formulário
- Situações que requerem atenção

### 4. **Error** (Vermelho)
- Erros críticos
- Falhas em operações
- Confirmações de exclusão

---

## ⚙️ API Completa

### `showAlert(options)`

```typescript
showAlert({
  title: string;           // Título do alerta
  message: string;         // Mensagem (aceita \n para quebras)
  type?: 'info' | 'success' | 'warning' | 'error';  // Padrão: 'info'
  confirmText?: string;    // Texto do botão OK (padrão: 'OK')
});
```

### `showConfirm(options)`

```typescript
showConfirm({
  title: string;           // Título do alerta
  message: string;         // Mensagem (aceita \n para quebras)
  type?: 'info' | 'success' | 'warning' | 'error';  // Padrão: 'warning'
  confirmText?: string;    // Texto do botão confirmar (padrão: 'OK')
  cancelText?: string;     // Texto do botão cancelar (padrão: 'Cancelar')
  onConfirm: () => void;   // Função executada ao confirmar
});
```

### Atalhos

```typescript
showSuccess(title: string, message: string)
showError(title: string, message: string)
showWarning(title: string, message: string)
showInfo(title: string, message: string)
```

---

## 🎭 Recursos Visuais

### Animações
- ✨ Fade in suave ao abrir
- ✨ Zoom in discreto
- ✨ Transições de cor nos botões

### Interatividade
- ⌨️ **ESC** - Fecha o alerta
- 🖱️ **Click no backdrop** - Fecha o alerta
- ❌ **Botão X** - Fecha o alerta

### Responsividade
- 📱 Mobile: Alerta ocupa 90% da largura
- 💻 Desktop: Alerta tem largura máxima de 28rem

---

## 🔄 Migração de Alertas Antigos

### Antes (Alert Nativo)

```typescript
alert('Por favor, preencha todos os campos.');
```

### Depois (Alert Moderno)

```typescript
showAlert({
  title: 'Campos Obrigatórios',
  message: 'Por favor, preencha todos os campos.',
  type: 'warning'
});
```

---

### Antes (Confirm Nativo)

```typescript
if (confirm('Tem certeza que deseja excluir?')) {
  deleteItem();
}
```

### Depois (Confirm Moderno)

```typescript
showConfirm({
  title: 'Confirmar Exclusão',
  message: 'Tem certeza que deseja excluir?',
  type: 'error',
  confirmText: 'Sim, Excluir',
  onConfirm: () => deleteItem()
});
```

---

## 📁 Arquivos do Sistema

### Componente Principal
`frontend/src/components/AlertDialog.tsx`
- Componente visual do alerta
- Gerencia animações e estilos
- Suporta todos os tipos de alerta

### Hook Customizado
`frontend/src/hooks/useAlert.tsx`
- Facilita o uso dos alertas
- Gerencia estado do alerta
- Fornece funções auxiliares

---

## ✅ Checklist de Implementação

Para adicionar alertas modernos em um novo componente:

- [ ] Importar `useAlert` hook
- [ ] Desestruturar as funções necessárias
- [ ] Adicionar `{AlertComponent}` no return
- [ ] Substituir `alert()` por `showAlert()` ou atalhos
- [ ] Substituir `confirm()` por `showConfirm()`
- [ ] Testar todos os cenários

---

## 🎯 Boas Práticas

### ✅ Fazer

```typescript
// Títulos curtos e descritivos
showSuccess('Salvo!', 'Horário criado com sucesso.');

// Mensagens claras e objetivas
showError('Erro ao Salvar', 'Não foi possível conectar ao servidor. Tente novamente.');

// Usar o tipo correto
showWarning('Atenção', 'Campos obrigatórios não preenchidos.');

// Confirmações para ações destrutivas
showConfirm({
  title: 'Confirmar Exclusão',
  message: 'Esta ação não pode ser desfeita.',
  type: 'error',
  onConfirm: () => deleteItem()
});
```

### ❌ Evitar

```typescript
// Títulos muito longos
showAlert({ title: 'Erro ao tentar salvar o horário no banco de dados', ... });

// Mensagens genéricas
showError('Erro', 'Algo deu errado.');

// Tipo errado
showSuccess('Erro', 'Falha ao salvar.'); // ❌ Sucesso com mensagem de erro

// Alert para ações destrutivas (use confirm)
showAlert({ title: 'Excluir?', ... }); // ❌ Use showConfirm
```

---

## 🐛 Troubleshooting

### Problema: Alerta não aparece

**Solução:**
1. Verifique se `{AlertComponent}` está no return
2. Verifique se o hook foi inicializado corretamente
3. Verifique o console por erros

### Problema: Múltiplos alertas ao mesmo tempo

**Solução:**
- O sistema mostra apenas um alerta por vez
- O último alerta chamado substitui o anterior
- Isso é intencional para evitar poluição visual

### Problema: Alerta não fecha com ESC

**Solução:**
- Verifique se não há outros event listeners bloqueando
- O alerta sempre fecha com ESC por padrão

---

## 🎉 Conclusão

Os alertas modernos oferecem:

✅ **Melhor UX** - Interface mais profissional  
✅ **Mais Controle** - Personalização completa  
✅ **Consistência** - Design uniforme em todo o sistema  
✅ **Acessibilidade** - Suporte a teclado e screen readers  

**Próximos passos:**
- Migrar todos os `alert()` e `confirm()` do sistema
- Adicionar mais tipos de alertas se necessário
- Considerar toasts para notificações não-bloqueantes

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Veja exemplos em `Horarios.tsx`
3. Verifique o console do navegador
4. Entre em contato com o suporte técnico
