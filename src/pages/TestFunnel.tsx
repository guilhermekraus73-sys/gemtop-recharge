import React, { useState } from 'react';
import { trackFunnel } from '@/hooks/useFunnelTracking';
import { Button } from '@/components/ui/button';

const TestFunnel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
    console.log(`[TEST] ${msg}`);
  };

  const testCheckout = async () => {
    addLog('Enviando: checkout');
    await trackFunnel('checkout', { productId: 'teste-123', source: 'teste' });
    addLog('✅ checkout enviado');
  };

  const testDados = async () => {
    addLog('Enviando: dados');
    await trackFunnel('dados', { productId: 'teste-123', source: 'teste' });
    addLog('✅ dados enviado');
  };

  const testPagamento = async () => {
    addLog('Enviando: pagamento');
    await trackFunnel('pagamento', { productId: 'teste-123', source: 'teste' });
    addLog('✅ pagamento enviado');
  };

  const testComprou = async () => {
    addLog('Enviando: comprou');
    await trackFunnel('comprou', { productId: 'teste-123', source: 'teste' });
    addLog('✅ comprou enviado');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">🧪 Teste do Funil</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testCheckout} className="bg-blue-500 hover:bg-blue-600">
            1. checkout
          </Button>
          <Button onClick={testDados} className="bg-green-500 hover:bg-green-600">
            2. dados
          </Button>
          <Button onClick={testPagamento} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            3. pagamento
          </Button>
          <Button onClick={testComprou} className="bg-purple-500 hover:bg-purple-600">
            4. comprou
          </Button>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-2 text-foreground">📋 Logs:</h2>
          <div className="space-y-1 text-sm font-mono max-h-64 overflow-y-auto">
            {logs.length === 0 && (
              <p className="text-muted-foreground">Clique nos botões para testar...</p>
            )}
            {logs.map((log, i) => (
              <p key={i} className="text-foreground">{log}</p>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Após clicar, verifique seus logs do backend para confirmar que os eventos chegaram.
        </p>
      </div>
    </div>
  );
};

export default TestFunnel;
