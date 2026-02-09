import { useMemo, useState } from "react";
import "./ContactPage.css";

const MIN_MESSAGE_LEN = 10;

function ContactPage() {
    const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    });

    const [touched, setTouched] = useState({});
    const [status, setStatus] = useState({ state: "idle", msg: "" });

    const errors = useMemo(() => {
    const next = {};

    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
        next.email = "Please enter a valid email address.";
    }
    if (!form.subject.trim()) next.subject = "Please add a subject.";
    if (!form.message.trim()) next.message = "Please write a message.";
    if (form.message.trim().length < MIN_MESSAGE_LEN) {
        next.message = `Message must be at least ${MIN_MESSAGE_LEN} characters.`;
    }

    return next;
    }, [form]);

    const canSubmit = Object.keys(errors).length === 0;

    function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    }

    async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });

    if (!canSubmit) return;

    setStatus({ state: "submitting", msg: "" });

    try {
        const API_URL = import.meta.env.VITE_API_URL;

        const response = await fetch(`${API_URL}/contact/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        });

        if (!response.ok) {
        throw new Error("Failed to submit contact form");
        }

        setStatus({
        state: "success",
        msg: "Thanks for reaching out. We’ll get back to you shortly.",
        });

        setForm({ name: "", email: "", subject: "", message: "" });
        setTouched({});
    } catch (error) {
        setStatus({
        state: "error",
        msg: "Something went wrong. Please try again later.",
        });
    }
    }

    function fieldError(name) {
    return touched[name] ? errors[name] : "";
    }

    return (
    <main className="container section contact-page">
        <header className="contact-page__header">
        <h1>Contact</h1>
        <p>
            If you have a question about Shelter, want to collaborate, or need help
            finding homelessness support services, please get in touch.
        </p>
        </header>

        <div className="contact-page__layout">
        <section className="contact-page__card">
            <h2>Send us a message</h2>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-form__row">
                <label htmlFor="name">Name</label>
                <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                />
                {fieldError("name") && (
                <p className="contact-form__error">{fieldError("name")}</p>
                )}
            </div>

            <div className="contact-form__row">
                <label htmlFor="email">Email</label>
                <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                />
                {fieldError("email") && (
                <p className="contact-form__error">{fieldError("email")}</p>
                )}
            </div>

            <div className="contact-form__row">
                <label htmlFor="subject">Subject</label>
                <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                />
                {fieldError("subject") && (
                <p className="contact-form__error">{fieldError("subject")}</p>
                )}
            </div>

            <div className="contact-form__row">
                <label htmlFor="message">Message</label>
                <textarea
                id="message"
                name="message"
                rows="6"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                />
                {fieldError("message") && (
                <p className="contact-form__error">{fieldError("message")}</p>
                )}
            </div>

            <button className="button" type="submit" disabled={status.state === "submitting"}>
                {status.state === "submitting" ? "Sending…" : "Send message"}
            </button>

            {status.state !== "idle" && (
                <p
                className={`contact-form__status ${
                    status.state === "success"
                    ? "contact-form__status--success"
                    : "contact-form__status--error"
                }`}
                role="status"
                >
                {status.msg}
                </p>
            )}
            </form>
        </section>
        </div>
    </main>
    );
}

export default ContactPage;