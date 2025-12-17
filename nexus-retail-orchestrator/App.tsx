import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { OrchestratorBrain } from './components/OrchestratorBrain';
import { Message, OrchestratorResponse, AgentName } from './types';
import { executeAgent } from './services/mockAgents';

// --- STRICT DEMO SCRIPT ---

const getScriptedResponse = (step: number, logs: string): OrchestratorResponse & { messageType?: 'text' | 'qr_code' } => {
  
  // --- STEP 1: INITIAL REQUEST (RED SHIRT) ---
  if (step === 1) {
    if (!logs) {
      return {
        thought_process: "Intent detected: 'Purchase Red Shirt'. \nStrategy: Check Inventory for target. Check Recommendations for backups. Check Loyalty for potential appeasement offers.",
        plan: ['inventory_agent', 'recommendation_agent', 'loyalty_agent'], 
        response_to_user: "One moment, let me check the stock and your member offers..."
      };
    } else {
      return {
        thought_process: "CRITICAL: Red Shirt is OUT_OF_STOCK. \nPositive: Yellow Shirt found. \nPositive: User is VIP (Discount Active). \nAction: Propose Yellow Shirt + Discount.",
        plan: [],
        response_to_user: "I have some bad news and some good news.\n\nThe **Red Shirt** is currently sold out. 😔\n\nHowever! I found the **Yellow Shirt** in your size. Since you are a VIP Gold member, I can apply a **15% discount** right now if you switch to Yellow. \n\nWould you like to proceed with the Yellow one?"
      };
    }
  }

  // --- STEP 2: USER ACCEPTS -> ASK PAYMENT METHOD ---
  if (step === 2) {
    // No agents run here, just a direct reply to the user saying "Yes"
    return {
      thought_process: "User accepted substitute. \nAction: Secure Payment Method. \nOptions: Credit Card (Stored), UPI, Apple Pay.",
      plan: [], 
      response_to_user: "Excellent choice. The total comes to **$45.00** after your discount.\n\nHow would you like to pay?\n\n1. Credit Card (Ending in 4242)\n2. UPI\n3. Apple Pay"
    };
  }

  // --- STEP 3: USER CHOOSES UPI -> SHOW QR CODE ---
  if (step === 3) {
    return {
      thought_process: "Payment Method: UPI selected. \nAction: Generate QR Code. \nAction: Start Payment Listener (Timeout: 10s).",
      plan: [],
      messageType: 'qr_code',
      response_to_user: "Please scan the QR code below to complete the payment of $45.00."
    };
  }

  // --- STEP 4: PAYMENT CONFIRMED (AUTO) -> FULFILL ---
  if (step === 4) {
    if (!logs) {
      // Phase A: Payment signal received. Execute backend.
      return {
        thought_process: "SYSTEM_SIGNAL: Payment Received via UPI. \nAction: Verify Transaction (Payment Agent). \nAction: Dispatch Order (Fulfillment Agent).",
        plan: ['payment_agent', 'fulfillment_agent'],
        response_to_user: "Payment received! Verifying transaction details..."
      };
    } else {
      // Phase B: Done.
      return {
        thought_process: "Payment: VERIFIED. \nLogistics: DISPATCHED. \nState: Order Closed.",
        plan: [],
        response_to_user: "Success! 🎉\n\nYour order for the **Yellow Shirt** has been confirmed.\n\n• Order ID: #ORD-7782\n• Delivery: Tomorrow via Express.\n\nThank you for shopping with Nexus!\n\n[Track your shipment live here](https://nexus-retail-demo.ai/track/ORD-7782)"
      };
    }
  }

  // Fallback
  return {
    thought_process: "Waiting for user input...",
    plan: [],
    response_to_user: "I'm ready for your next request."
  };
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Nexus Retail. I am your agentic concierge.",
      timestamp: new Date(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrchestratorResponse, setLastOrchestratorResponse] = useState<OrchestratorResponse | null>(null);
  const [activeAgents, setActiveAgents] = useState<AgentName[]>([]);
  
  // 0=Start, 1=Red Shirt, 2=Accept Offer, 3=UPI Selected(QR), 4=Paid/Done
  const [demoStep, setDemoStep] = useState(0);

  // Suggested inputs
  const getSuggestedInput = () => {
    if (demoStep === 0) return "I want to buy a Red Shirt";
    if (demoStep === 1) return "Yes, buy the Yellow Shirt";
    if (demoStep === 2) return "Use UPI";
    return "Reset Demo";
  };

  // --- AUTO-PAYMENT TIMER LOGIC ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (demoStep === 3) {
       // If we are in the QR Code step, wait 10 seconds then auto-advance
       timer = setTimeout(() => {
          handleAutoPaymentSuccess();
       }, 10000); // 10 seconds
    }
    return () => clearTimeout(timer);
  }, [demoStep]);

  const handleAutoPaymentSuccess = async () => {
    setDemoStep(4);
    setIsProcessing(true);
    // Trigger Step 4 logic
    await processTurn(4, "");
  };
  // --------------------------------

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    if (text === "Reset Demo") {
        window.location.reload();
        return;
    }

    // Determine next step
    let nextStep = demoStep;
    if (demoStep === 0) nextStep = 1;      // Ask for item
    else if (demoStep === 1) nextStep = 2; // Accept sub
    else if (demoStep === 2) nextStep = 3; // Choose Payment
    
    // If we are at step 3, we wait for timer, user can't manually advance easily unless they type something, 
    // but for the sake of the demo script, manual typing "Done" could also work, but we rely on timer.
    
    setDemoStep(nextStep);

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Trigger Bot Logic
    await processTurn(nextStep, "");
  };

  const processTurn = async (currentStep: number, logs: string) => {
    
    // Simulate thinking delay (shorter for the auto-payment step)
    const delay = currentStep === 4 ? 500 : 800;
    await new Promise(r => setTimeout(r, delay));

    const response = getScriptedResponse(currentStep, logs);
    setLastOrchestratorResponse(response);
    
    // Add Bot Message
    const assistantMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.response_to_user,
      messageType: response.messageType, // Pass through QR type
      timestamp: new Date(),
      metadata: {
        thought_process: response.thought_process,
        plan: response.plan
      }
    };
    setMessages(prev => [...prev, assistantMsg]);

    // Check plan execution
    if (response.plan && response.plan.length > 0) {
      setActiveAgents(response.plan);
      
      const agentPromises = response.plan.map(agent => executeAgent(agent, ""));
      const results = await Promise.all(agentPromises);
      const systemLog = results.join('\n');
      
      setTimeout(async () => {
         setActiveAgents([]);
         await processTurn(currentStep, systemLog);
      }, 1500);

    } else {
      setIsProcessing(false);
      setActiveAgents([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[90vh]">
        
        {/* Left Column: Chat */}
        <div className="lg:col-span-4 h-full flex flex-col gap-4">
          <div className="flex-1 overflow-hidden">
             <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isTyping={isProcessing} 
             />
          </div>
          
          {/* Guided Action Button */}
          {!isProcessing && demoStep < 3 && (
              <button 
                onClick={() => handleSendMessage(getSuggestedInput())}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Tap to Say:</span>
                <span className="bg-emerald-800/50 px-2 py-1 rounded text-sm font-mono">"{getSuggestedInput()}"</span>
              </button>
          )}
           {/* Special Message for QR Step */}
           {demoStep === 3 && (
             <div className="w-full py-4 bg-slate-800 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 animate-pulse">
                <span>Waiting for payment... (10s)</span>
             </div>
           )}
        </div>

        {/* Right Column: Brain */}
        <div className="lg:col-span-8 h-full flex flex-col gap-6">
          <OrchestratorBrain 
            lastResponse={lastOrchestratorResponse}
            activeAgents={activeAgents}
            isProcessing={isProcessing}
          />
          
          <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 overflow-hidden flex flex-col">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Demo Control & State</h3>
             
             <div className="grid grid-cols-4 gap-2 mb-6">
                 <div className={`p-3 border rounded-xl transition-colors ${demoStep === 0 ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                    <div className="text-[10px] text-slate-400 mb-1">Step 1</div>
                    <div className="font-semibold text-xs">Request</div>
                 </div>
                 <div className={`p-3 border rounded-xl transition-colors ${demoStep === 1 ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                    <div className="text-[10px] text-slate-400 mb-1">Step 2</div>
                    <div className="font-semibold text-xs">Failure</div>
                 </div>
                 <div className={`p-3 border rounded-xl transition-colors ${demoStep === 2 ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                    <div className="text-[10px] text-slate-400 mb-1">Step 3</div>
                    <div className="font-semibold text-xs">Opts</div>
                 </div>
                 <div className={`p-3 border rounded-xl transition-colors ${demoStep === 3 || demoStep === 4 ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                    <div className="text-[10px] text-slate-400 mb-1">Step 4</div>
                    <div className="font-semibold text-xs">Pay/QR</div>
                 </div>
             </div>

             <div className="mt-auto p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
               <h4 className="text-blue-400 text-sm font-bold mb-2">Current Instructions:</h4>
               <p className="text-slate-300 text-sm">
                 {demoStep === 0 && "Please click the button to ask for a 'Red Shirt'."}
                 {demoStep === 1 && "Click 'Yes' to accept the offer."}
                 {demoStep === 2 && "Choose 'Use UPI' to see the QR code."}
                 {demoStep === 3 && "Displaying QR Code... Auto-completing payment in 10 seconds..."}
                 {demoStep === 4 && "Demo Finished. Transaction Verified."}
               </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;