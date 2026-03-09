
const SUPABASE_URL = window.env.SUPABASE_URL;
const SUPABASE_KEY = window.env.SUPABASE_KEY;

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

setTodayDate();
loadExpenses();

function setTodayDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
}

async function addExpense() {

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const paymentMethod = document.getElementById("payment-method").value;
    const notes = document.getElementById("notes").value;

    const error = document.getElementById("error");
    error.innerText = "";

    if (!category) {
        error.innerText = "Category required";
        return;
    }

    if (!amount || amount <= 0) {
        error.innerText = "Enter valid amount";
        return;
    }

    if (!paymentMethod) {
        error.innerText = "Select payment method";
        return;
    }


    await client
        .from("expenses")
        .insert({
            date: date,
            category: category,
            amount: amount,
            paymentMethod: paymentMethod,
            notes: notes
        });

    clearForm();
    loadExpenses();
}

function clearForm() {
    document.getElementById("amount").value = "";
    document.getElementById("notes").value = "";
    document.getElementById("category").value = "";
    document.getElementById("payment-method").value = "";
    setTodayDate();
}

async function loadExpenses() {

    let query = client.from("expenses").select("*");
    // let query = client
    //     .from("expenses")
    //     .select("*")
    //     .not("notes", "ilike", "%testexp%");

    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const category = document.getElementById("filterCategory").value;

    if (start) query = query.gte("date", start);
    if (end) query = query.lte("date", end);
    if (category) query = query.eq("category", category);

    const { data } = await query.order("date", { ascending: false });

    renderExpenses(data);
}

function renderExpenses(data) {

    const container = document.getElementById("expenseList");

    container.innerHTML = "";

    let total = 0;

    data.forEach(e => {

        total += Number(e.amount);

        container.innerHTML += `
            <div class="card">
            <div class="card-top">
            <span>${e.category}</span>
            <span>₹${e.amount}</span>
            <span>₹${e.paymentMethod}</span>
            </div>
            <div class="card-bottom">
            ${e.date} • ${e.notes || ""}
            </div>
            </div>
        `;

    });

    document.getElementById("totalAmount").innerText = total;

}