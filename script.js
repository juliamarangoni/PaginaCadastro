const form = document.getElementById("form-cadastro");
const campoCPF = document.getElementById("cpf");

// 1) CPF: apaga na hora qualquer caractere que não seja número
campoCPF.addEventListener("input", () => {
    campoCPF.value = campoCPF.value.replace(/\D/g, "");
});

// 2) Hash da senha (SHA-256) com sal aleatório
function gerarSal() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function gerarHash(texto) {
    const dados = new TextEncoder().encode(texto);
    const buffer = await crypto.subtle.digest("SHA-256", dados);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// 3) Baixa um arquivo .txt com o conteúdo recebido
function baixarTxt(conteudo, nomeArquivo) {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
}

// 4) Envio do formulário
form.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // impede a página de recarregar

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = campoCPF.value;
    const endereco = document.getElementById("endereco").value.trim();
    const senha = document.getElementById("senha").value;
    const imagem = document.getElementById("imagem").files[0];

    // E-mail: precisa ter @ com algo antes e depois (e um ponto no domínio)
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
        alert("Digite um e-mail válido, com @ (exemplo: nome@dominio.com).");
        return;
    }

    // CPF: só números, exatamente 11
    if (!/^\d{11}$/.test(cpf)) {
        alert("O CPF deve ter exatamente 11 números.");
        return;
    }

    // Senha: hash com sal
    const sal = gerarSal();
    const senhaHash = await gerarHash(sal + senha);

    const conteudo =
`Nome: ${nome}
E-mail: ${email}
CPF: ${cpf}
Endereço: ${endereco}
Imagem: ${imagem ? imagem.name : "nenhuma"}
Sal: ${sal}
Senha (hash SHA-256): ${senhaHash}
`;

    baixarTxt(conteudo, "cadastro.txt");
});