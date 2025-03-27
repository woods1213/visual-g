let temaEscuro = true;

function alterarTema() {
    temaEscuro = !temaEscuro;
    const botaoTema = document.getElementById("toggle-theme");
    if (temaEscuro) {
        document.documentElement.style.setProperty('--bg-color', 'var(--bg-color-dark)');
        document.documentElement.style.setProperty('--text-color', 'var(--text-color-dark)');
        document.documentElement.style.setProperty('--box-color', 'var(--box-color-dark)');
        document.documentElement.style.setProperty('--shadow-color', 'var(--shadow-color-dark)');
        botaoTema.textContent = "🌙"; // Lua para o modo escuro
    } else {
        document.documentElement.style.setProperty('--bg-color', 'var(--bg-color-light)');
        document.documentElement.style.setProperty('--text-color', 'var(--text-color-light)');
        document.documentElement.style.setProperty('--box-color', 'var(--box-color-light)');
        document.documentElement.style.setProperty('--shadow-color', 'var(--shadow-color-light)');
        botaoTema.textContent = "☀️"; // Sol para o modo claro
    }
}


function interpretar() {
    const codigo = document.getElementById("codigo").value.split("\n");
    let variaveis = {};
    let tipos = {};
    let resultado = "";
    let dentroAlgoritmo = false;
    let dentroInicio = false;

    for (let linha of codigo) {
        linha = linha.trim();

        // Reconhecer início do algoritmo sem exibi-lo no resultado
        if (linha.startsWith("algoritmo")) {
            dentroAlgoritmo = true;
            continue; // Reconhece, mas não adiciona ao resultado
        } else if (linha === "fimalgoritmo") {
            dentroAlgoritmo = false;
            resultado += "Fim do algoritmo.<br>";
            break;
        } else if (!dentroAlgoritmo) {
            continue;
        }

        // Reconhecer início do bloco "inicio"
        if (linha === "inicio") {
            dentroInicio = true;
            resultado += "Início do bloco principal.<br>";
            continue;
        } else if (linha === "fimalgoritmo") {
            dentroInicio = false;
        }

        // Ignorar "var"
        else if (linha.startsWith("var")) {
            continue;
        }

        // Processar a declaração de variáveis com tipos
        else if (linha.includes(":") && !dentroInicio) {
            const [declaracao, tipo] = linha.split(":").map(str => str.trim());
            const nomes = declaracao.split(",");
            for (let nome of nomes) {
                nome = nome.trim();
                if (tipo === "real") {
                    variaveis[nome] = 0.0;
                    tipos[nome] = "real";
                } else if (tipo === "inteiro") {
                    variaveis[nome] = 0;
                    tipos[nome] = "inteiro";
                } else if (tipo === "logico") {
                    variaveis[nome] = false;
                    tipos[nome] = "logico";
                } else {
                    resultado += `Tipo desconhecido para a variável: ${nome}<br>`;
                }
            }
            atualizarMemoria(variaveis, tipos, "Global");
            continue;
        }

        // Comando "escreval"
        else if (linha.startsWith("escreval")) {
            const conteudo = linha.match(/escreval\((.+)\)/);
            if (conteudo) {
                const partes = conteudo[1]
                    .split(",")
                    .map(str => str.trim())
                    .map(part => {
                        if (part.startsWith('"') && part.endsWith('"')) {
                            return part.slice(1, -1); // String literal
                        } else if (variaveis[part] !== undefined) {
                            return variaveis[part]; // Variável
                        } else {
                            try {
                                return eval(part.replace(/(\b[a-zA-Z]\w*\b)/g, match => variaveis[match] !== undefined ? variaveis[match] : match));
                            } catch {
                                return `Erro em expressão: ${part}`;
                            }
                        }
                    });
                resultado += partes.join("") + "<br>";
            } else {
                resultado += "Erro de sintaxe em escreval.<br>";
            }
        }

        // Comando "leia"
        else if (linha.startsWith("leia")) {
            const varNome = linha.match(/leia\((.+)\)/);
            if (varNome) {
                const nome = varNome[1].trim();
                if (variaveis[nome] !== undefined) {
                    const valor = prompt(`Digite o valor para ${nome}:`);
                    variaveis[nome] = parseFloat(valor); // Conversão para número
                } else {
                    resultado += `Variável não declarada: ${nome}<br>`;
                }
                atualizarMemoria(variaveis, tipos, "Local");
            } else {
                resultado += "Erro de sintaxe em leia.<br>";
            }
        }
        // Operações como "<-"
        else if (linha.includes("<-")) {
            const [varNome, expressao] = linha.split("<-").map(str => str.trim());
            if (variaveis[varNome] !== undefined) {
                try {
                    variaveis[varNome] = eval(expressao.replace(/(\b[a-zA-Z_]\w*\b)/g, match =>
                        variaveis[match] !== undefined ? variaveis[match] : match
                    ));
                } catch (err) {
                    resultado += `Erro de cálculo na variável ${varNome}: ${expressao}<br>`;
                }
            } else {
                resultado += `Variável não declarada: ${varNome}<br>`;
            }
            atualizarMemoria(variaveis, tipos, "Local");
        }

        // Caso nenhum comando seja reconhecido
        else {
            resultado += `Linha não reconhecida: "${linha}"<br>`;
        }
    }

    document.getElementById("resultado").innerHTML = resultado;
}
function atualizarMemoria(variaveis, tipos, escopo) {
    const memoria = document.getElementById("memoria");
    memoria.innerHTML = ""; // Limpa a tabela antes de atualizá-la

    for (let [nome, valor] of Object.entries(variaveis)) {
        const tipo = tipos[nome] || "desconhecido";
        const row = `<tr>
            <td>${nome}</td>
            <td>${valor}</td>
            <td>${tipo}</td>
            <td>${escopo}</td>
        </tr>`;
        memoria.innerHTML += row;
    }
}
