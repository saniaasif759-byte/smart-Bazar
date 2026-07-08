import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, MapPin, Truck, CheckCircle2, Phone } from 'lucide-react';
import { Product } from './ProductCard';

interface CartItem extends Product {
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (address: string, phone: string, paymentMethod: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartModalProps) {
  const [step, setStep] = React.useState<'cart' | 'checkout' | 'success'>('cart');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'cod' | 'easypaisa' | 'card'>('cod');
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardName, setCardName] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');
  const [cardCvv, setCardCvv] = React.useState('');
  const [txId, setTxId] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [placedItemsCount, setPlacedItemsCount] = React.useState(0);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleNextStep = async () => {
    if (step === 'cart') setStep('checkout');
    else if (step === 'checkout') {
      if (!address.trim()) {
        alert('Please enter your delivery address');
        return;
      }
      if (!phone.trim()) {
        alert('Please enter your phone number');
        return;
      }

      if (paymentMethod === 'card') {
        if (!cardNumber.trim() || cardNumber.length < 15) {
          alert('Please enter a valid Card Number');
          return;
        }
        if (!cardName.trim()) {
          alert('Please enter Cardholder Name');
          return;
        }
        if (!cardExpiry.trim()) {
          alert('Please enter Expiry Date (MM/YY)');
          return;
        }
        if (!cardCvv.trim() || cardCvv.length < 3) {
          alert('Please enter valid CVV');
          return;
        }
      }

      if (paymentMethod === 'easypaisa') {
        if (!txId.trim()) {
          alert('Please enter the EasyPaisa/JazzCash Transaction ID (TxID)');
          return;
        }
      }
      
      setSubmitting(true);
      setErrorText(null);
      
      try {
        setPlacedItemsCount(items.length);
        
        let displayPaymentMethod = 'Cash on Delivery (COD)';
        if (paymentMethod === 'card') {
          displayPaymentMethod = `Card (${cardNumber.slice(-4)}) - Name: ${cardName}`;
        } else if (paymentMethod === 'easypaisa') {
          displayPaymentMethod = `EasyPaisa / JazzCash (TxID: ${txId})`;
        }

        const response = await onCheckout(address, phone, displayPaymentMethod);
        if (response.success) {
          setStep('success');
        } else {
          setErrorText(response.error || "Order save nahi ho saka. Supabase permissions check karein.");
        }
      } catch (err: any) {
        setErrorText(err?.message || "Supabase integration connection failed.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-2xl">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {step === 'cart' && "Your Smart List"}
                {step === 'checkout' && "Checkout"}
                {step === 'success' && "Order Placed!"}
              </h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                {step === 'success' ? placedItemsCount : items.length} Items Selected
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {items.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="font-bold text-gray-400">Your bag is empty. Start adding items!</p>
                  </div>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl group">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-emerald-600 font-black text-sm">Rs.{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 hover:bg-gray-50 rounded-lg"
                          >
                            <Minus className="w-4 h-4 text-gray-400" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 hover:bg-gray-50 rounded-lg"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    <div className="pt-6 space-y-4">
                      <div className="flex justify-between items-center text-gray-400 font-bold text-sm px-2">
                        <span>Items Total</span>
                        <span>Rs.{total}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400 font-bold text-sm px-2">
                        <span>Delivery Fee</span>
                        <span className="text-emerald-500">FREE</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-900 font-black text-xl px-2 pt-2 border-t border-gray-100">
                        <span>Grand Total</span>
                        <span>Rs.{total}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to clear your entire list?')) {
                             items.forEach(item => onRemoveItem(item.id));
                          }
                        }}
                        className="w-full py-3 text-red-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Clear Smart List
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 'checkout' && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-emerald-500" />
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, City, Apartment number..."
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-3xl p-4 pl-12 min-h-[100px] font-bold text-gray-700 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-[1.5rem] p-4 pl-12 font-bold text-gray-700 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                  <div className="flex gap-4">
                    <div className="bg-emerald-100 p-3 rounded-2xl h-fit">
                      <Truck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900">Express Delivery</h4>
                      <p className="text-xs text-emerald-600 font-medium">Your order will arrive at your home within 30-45 minutes in Sahiwal.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Select Payment Method</label>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Option 1: Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex items-start gap-4 p-4 rounded-3xl border-2 text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-sm shadow-emerald-100'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100/80'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${paymentMethod === 'cod' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</h4>
                          {paymentMethod === 'cod' && (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Selected</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Pay with physical cash when the delivery agent arrives.</p>
                      </div>
                    </button>

                    {/* Option 2: EasyPaisa / JazzCash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`flex items-start gap-4 p-4 rounded-3xl border-2 text-left transition-all ${
                        paymentMethod === 'easypaisa'
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-sm shadow-emerald-100'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100/80'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${paymentMethod === 'easypaisa' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm">EasyPaisa / JazzCash</h4>
                          {paymentMethod === 'easypaisa' && (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Selected</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Transfer directly to our mobile wallet and provide Transaction ID.</p>
                      </div>
                    </button>

                    {/* Option 3: Credit/Debit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-start gap-4 p-4 rounded-3xl border-2 text-left transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-sm shadow-emerald-100'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100/80'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${paymentMethod === 'card' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm">Credit / Debit Card</h4>
                          {paymentMethod === 'card' && (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Selected</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Secure online payment using Visa, MasterCard, or UnionPay.</p>
                      </div>
                    </button>
                  </div>

                  {/* Payment Details Sub-forms */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'easypaisa' && (
                      <motion.div
                        key="easypaisa-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100 space-y-4 overflow-hidden"
                      >
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Our Mobile Account</p>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-emerald-800 text-lg">0300 1234567</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">EasyPaisa (Smart Bazar)</span>
                          </div>
                          <p className="text-[11px] text-emerald-600 leading-normal font-medium">
                            Is number par total amount <strong className="font-black">Rs.{total}</strong> send karain, aur transaction complete hone ke baad neechay Transaction ID (TxID) enter karain.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Transaction ID (TxID)</label>
                          <input
                            type="text"
                            value={txId}
                            onChange={(e) => setTxId(e.target.value)}
                            placeholder="e.g. 18273648592"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 font-mono font-bold text-gray-700 outline-none transition-all text-sm"
                          />
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'card' && (
                      <motion.div
                        key="card-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 space-y-4 overflow-hidden"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Card Number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => {
                                // Formatter for card spacing
                                const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                const matches = val.match(/\d{4,16}/g);
                                const match = (matches && matches[0]) || '';
                                const parts = [];
                                for (let i = 0, len = match.length; i < len; i += 4) {
                                  parts.push(match.substring(i, i + 4));
                                }
                                if (parts.length > 0) {
                                  setCardNumber(parts.join(' '));
                                } else {
                                  setCardNumber(val);
                                }
                              }}
                              maxLength={19}
                              placeholder="4000 1234 5678 9010"
                              className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 pl-10 font-bold text-gray-700 outline-none transition-all text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name as written on card"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 font-bold text-gray-700 outline-none transition-all text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Expiry Date</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length > 2) {
                                  val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              maxLength={5}
                              placeholder="MM/YY"
                              className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 font-bold text-gray-700 outline-none transition-all text-sm text-center"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">CVV Code</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                              maxLength={4}
                              placeholder="123"
                              className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 font-bold text-gray-700 outline-none transition-all text-sm text-center"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Summary Box */}
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <div className="flex justify-between items-center text-lg font-black text-gray-900">
                      <span className="text-gray-500 text-sm font-bold">Total Payable Amount</span>
                      <span className="text-emerald-600">Rs.{total}</span>
                    </div>
                  </div>
                </div>

                {errorText && (
                  <div className="bg-amber-50 text-amber-950 p-5 rounded-3xl border border-amber-200 text-xs font-medium leading-relaxed space-y-2">
                    <p className="font-black text-amber-900 flex items-center gap-1">⚠️ Supabase me save nahi ho saka!</p>
                    <p className="bg-white/80 p-2.5 rounded-xl font-mono border border-amber-100 text-[11px] overflow-auto select-all">{errorText}</p>
                    <p className="text-[10px] text-amber-700">Aapka order localStorage database ma safe ha lekin online save ni hoa, rules ya columns review kijiye.</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-500 font-bold mb-8 px-8">Your order has been placed. Our agent will contact you shortly for confirmation at {phone}.</p>
                
                <div className="flex flex-col gap-3 px-8">
                  <button 
                    onClick={onClose}
                    className="w-full bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200"
                  >
                    Back to Bazzar
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this order?')) {
                        setStep('cart');
                        alert('Order Cancelled successfully.');
                      }
                    }}
                    className="w-full bg-red-50 text-red-500 px-8 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all text-sm"
                  >
                    Cancel Order
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== 'success' && items.length > 0 && (
            <div className="mt-8 flex flex-col gap-3 text-center">
              <div className="flex gap-3">
                {step === 'checkout' && (
                  <button 
                    type="button"
                    disabled={submitting}
                    onClick={() => setStep('cart')}
                    className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                )}
                <button 
                  type="button"
                  disabled={submitting}
                  onClick={handleNextStep}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving Order...</span>
                    </div>
                  ) : (
                    <>
                      {step === 'cart' ? "Proceed to Checkout" : "Confirm Order"}
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              
              {step === 'checkout' && (
                <button 
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    if (confirm('Cancel this checkout process?')) {
                      onClose();
                    }
                  }}
                  className="w-full py-3 text-red-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 disabled:opacity-50"
                >
                  Cancel Order & Close
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
