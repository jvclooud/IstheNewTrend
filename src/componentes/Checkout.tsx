import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import "./checkout.css";

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const secret = sessionStorage.getItem("stripe_client_secret");
    if (!secret) {
      setStatus("Nenhum pagamento iniciado. Volte ao carrinho.");
      return;
    }
    setClientSecret(secret);
  }, []);

  const pagar = async () => {
    if (!stripe || !elements) return;
    if (!clientSecret) return;

    setLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement)!,
      },
    });

    if (result.error) {
      setStatus("Erro: " + result.error.message);
    } else if (result.paymentIntent?.status === "succeeded") {
      setStatus("Pagamento aprovado! 🎉");
      sessionStorage.removeItem("stripe_client_secret");
    }

    setLoading(false);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1>Finalizar Pagamento</h1>

        {!clientSecret && <p>Carregando pagamento...</p>}

        {clientSecret && (
          <>
            <div className="input-group">
              <label>Número do Cartão</label>
              <CardNumberElement className="stripe-input" />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Validade</label>
                <CardExpiryElement className="stripe-input" />
              </div>

              <div className="input-group">
                <label>CVC</label>
                <CardCvcElement className="stripe-input" />
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={pagar}
              disabled={loading}
            >
              {loading ? "Processando..." : "Pagar Agora"}
            </button>

            {status && <p className="checkout-status">{status}</p>}
          </>
        )}
      </div>
    </div>
  );
}