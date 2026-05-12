import { FormEvent, useEffect, useState } from "react";

type Customer = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  createdAt: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const loadCustomers = async () => {
    const res = await fetch(`${apiBase}/customers`);
    const data = await res.json();
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers().catch(() => setError("Could not load customers"));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${apiBase}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email: email || undefined, phone: phone || undefined })
    });

    if (!res.ok) {
      setError("Failed to create customer");
      return;
    }

    setFullName("");
    setEmail("");
    setPhone("");
    await loadCustomers();
  };

  return (
    <main className="container">
      <h1>The Manor Hotel CRM</h1>
      <p>Manage hotel guests and customer relationships.</p>

      <section className="card">
        <h2>Add Customer</h2>
        <form onSubmit={submit}>
          <div className="row">
            <input
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button type="submit">Save customer</button>
          </div>
        </form>
        {error ? <p>{error}</p> : null}
      </section>

      <section className="card">
        <h2>Customers</h2>
        <div className="list">
          {customers.map((customer) => (
            <article key={customer.id} className="card">
              <strong>{customer.fullName}</strong>
              <div>{customer.email || "No email"}</div>
              <div>{customer.phone || "No phone"}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
