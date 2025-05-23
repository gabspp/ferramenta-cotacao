// Variáveis globais
let listaItens = [];
let tabelaCotacao = [];
let fornecedores = [
    { nome: "Arcofoods", index: 0 },
    { nome: "Rio Quality", index: 1 },
    { nome: "Top Alto", index: 2 },
    { nome: "CCN", index: 3 }
];

// Elementos DOM
const novoItemInput = document.getElementById('novo-item');
const quantidadeItemInput = document.getElementById('quantidade-item');
const adicionarItemBtn = document.getElementById('adicionar-item');
const listaItensEl = document.getElementById('lista-itens');
const limparListaBtn = document.getElementById('limpar-lista');
const gerarMensagemBtn = document.getElementById('gerar-mensagem');
const mensagemContainer = document.getElementById('mensagem-container');
const mensagemItensEl = document.getElementById('mensagem-itens');
const copiarMensagemBtn = document.getElementById('copiar-mensagem');
const copiaFeedback = document.getElementById('copia-feedback');
const adicionarFornecedorBtn = document.getElementById('adicionar-fornecedor');
const zerarTabelaBtn = document.getElementById('zerar-tabela');
const cabecalhoTabela = document.getElementById('cabecalho-tabela');
const corpoTabela = document.getElementById('corpo-tabela');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosLocais();
    renderizarListaItens();
    renderizarTabelaCotacao();
    atualizarTotais();
    
    // Event listeners
    adicionarItemBtn.addEventListener('click', adicionarItem);
    limparListaBtn.addEventListener('click', limparLista);
    gerarMensagemBtn.addEventListener('click', gerarMensagem);
    copiarMensagemBtn.addEventListener('click', copiarMensagem);
    adicionarFornecedorBtn.addEventListener('click', adicionarFornecedor);
    zerarTabelaBtn.addEventListener('click', zerarTabela);
    
    // Event listeners para elementos dinâmicos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remover-item')) {
            const index = parseInt(e.target.dataset.index);
            removerItem(index);
        }
        
        if (e.target.classList.contains('remover-fornecedor')) {
            const fornecedorHeader = e.target.closest('.fornecedor-header');
            const fornecedorCol = fornecedorHeader.closest('.fornecedor-col');
            const index = parseInt(fornecedorCol.dataset.index);
            removerFornecedor(index);
        }
    });
    
    // Event listener para mudança de nome de fornecedor
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('fornecedor-nome')) {
            const fornecedorCol = e.target.closest('.fornecedor-col');
            const index = parseInt(fornecedorCol.dataset.index);
            atualizarNomeFornecedor(index, e.target.value);
        }
        
        if (e.target.classList.contains('preco-input')) {
            const row = e.target.closest('tr');
            const itemIndex = parseInt(row.dataset.itemIndex);
            const fornecedorIndex = parseInt(e.target.dataset.fornecedorIndex);
            atualizarPreco(itemIndex, fornecedorIndex, e.target.value);
        }
    });
});

// Funções para manipulação da lista de itens
function adicionarItem() {
    const nome = novoItemInput.value.trim();
    const quantidade = parseInt(quantidadeItemInput.value) || 1;
    
    if (nome) {
        listaItens.push({ nome, quantidade });
        novoItemInput.value = '';
        quantidadeItemInput.value = '1';
        renderizarListaItens();
        atualizarTabelaCotacao();
        salvarDadosLocais();
    }
}

function removerItem(index) {
    listaItens.splice(index, 1);
    renderizarListaItens();
    atualizarTabelaCotacao();
    salvarDadosLocais();
}

function limparLista() {
    listaItens = [];
    renderizarListaItens();
    atualizarTabelaCotacao();
    salvarDadosLocais();
}

function renderizarListaItens() {
    listaItensEl.innerHTML = '';
    
    listaItens.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.nome} (${item.quantidade})</span>
            <div class="item-actions">
                <span class="remover-item" data-index="${index}">×</span>
            </div>
        `;
        listaItensEl.appendChild(li);
    });
}

// Funções para a mensagem
function gerarMensagem() {
    if (listaItens.length === 0) {
        alert('Adicione pelo menos um item à lista.');
        return;
    }
    
    mensagemItensEl.innerHTML = '';
    
    listaItens.forEach(item => {
        const li = document.createElement('li');
        // Removendo a quantidade dos itens na mensagem
        li.textContent = item.nome;
        mensagemItensEl.appendChild(li);
    });
    
    mensagemContainer.classList.remove('hidden');
}

function copiarMensagem() {
    // Criar uma versão otimizada da mensagem para WhatsApp
    let mensagemOtimizada = "Bom dia! Gostaria de verificar a disponibilidade e os preços dos seguintes itens:";
    
    // Adicionar cada item em uma nova linha, sem formatação extra
    listaItens.forEach(item => {
        mensagemOtimizada += "\n- " + item.nome;
    });
    
    mensagemOtimizada += "\n\nObrigado!";
    
    // Copiar a mensagem otimizada
    navigator.clipboard.writeText(mensagemOtimizada)
        .then(() => {
            copiaFeedback.classList.remove('hidden');
            setTimeout(() => {
                copiaFeedback.classList.add('hidden');
            }, 2000);
        })
        .catch(err => {
            console.error('Erro ao copiar texto: ', err);
            alert('Não foi possível copiar a mensagem. Por favor, selecione o texto e copie manualmente.');
        });
}

// Funções para a tabela de cotação
function adicionarFornecedor() {
    const novoIndex = fornecedores.length > 0 ? 
        Math.max(...fornecedores.map(f => f.index)) + 1 : 0;
    
    fornecedores.push({
        nome: `Fornecedor ${novoIndex + 1}`,
        index: novoIndex
    });
    
    atualizarCabecalhoTabela();
    atualizarTabelaCotacao();
    salvarDadosLocais();
}

function removerFornecedor(index) {
    if (fornecedores.length <= 1) {
        alert('É necessário manter pelo menos um fornecedor.');
        return;
    }
    
    fornecedores = fornecedores.filter(f => f.index !== index);
    atualizarCabecalhoTabela();
    atualizarTabelaCotacao();
    salvarDadosLocais();
}

function atualizarNomeFornecedor(index, novoNome) {
    const fornecedor = fornecedores.find(f => f.index === index);
    if (fornecedor) {
        fornecedor.nome = novoNome;
        salvarDadosLocais();
    }
}

function atualizarCabecalhoTabela() {
    // Manter as duas primeiras colunas (Item e Quantidade)
    while (cabecalhoTabela.children.length > 2) {
        cabecalhoTabela.removeChild(cabecalhoTabela.children[2]);
    }
    
    // Adicionar colunas de fornecedores
    fornecedores.forEach(fornecedor => {
        const th = document.createElement('th');
        th.className = 'fornecedor-col';
        th.dataset.index = fornecedor.index;
        th.innerHTML = `
            <div class="fornecedor-header">
                <input type="text" class="fornecedor-nome" value="${fornecedor.nome}">
                <button class="remover-fornecedor">×</button>
            </div>
        `;
        cabecalhoTabela.appendChild(th);
    });
    
    // Adicionar coluna de melhor preço
    const thMelhorPreco = document.createElement('th');
    thMelhorPreco.textContent = 'Melhor Preço';
    cabecalhoTabela.appendChild(thMelhorPreco);
}

function atualizarTabelaCotacao() {
    // Inicializar tabela de cotação se necessário
    if (!tabelaCotacao) {
        tabelaCotacao = [];
    }
    
    // Atualizar tabela com base na lista de itens
    listaItens.forEach((item, index) => {
        if (!tabelaCotacao[index]) {
            tabelaCotacao[index] = {
                nome: item.nome,
                quantidade: item.quantidade,
                precos: {}
            };
        } else {
            tabelaCotacao[index].nome = item.nome;
            tabelaCotacao[index].quantidade = item.quantidade;
        }
    });
    
    // Remover itens que não estão mais na lista
    tabelaCotacao = tabelaCotacao.filter((_, index) => index < listaItens.length);
    
    renderizarTabelaCotacao();
    atualizarTotais();
    salvarDadosLocais();
}

function renderizarTabelaCotacao() {
    corpoTabela.innerHTML = '';
    
    tabelaCotacao.forEach((item, itemIndex) => {
        const tr = document.createElement('tr');
        tr.dataset.itemIndex = itemIndex;
        
        // Coluna de nome do item
        const tdNome = document.createElement('td');
        tdNome.textContent = item.nome;
        tr.appendChild(tdNome);
        
        // Coluna de quantidade
        const tdQuantidade = document.createElement('td');
        tdQuantidade.textContent = item.quantidade;
        tr.appendChild(tdQuantidade);
        
        // Colunas de preços por fornecedor
        fornecedores.forEach(fornecedor => {
            const tdPreco = document.createElement('td');
            tdPreco.className = 'preco-cell';
            tdPreco.dataset.fornecedorIndex = fornecedor.index;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'preco-input';
            input.dataset.fornecedorIndex = fornecedor.index;
            input.step = '0.01';
            input.min = '0';
            input.value = item.precos[fornecedor.index] || '';
            
            tdPreco.appendChild(input);
            tr.appendChild(tdPreco);
        });
        
        // Coluna de melhor preço
        const tdMelhorPreco = document.createElement('td');
        tdMelhorPreco.className = 'melhor-preco-cell';
        tr.appendChild(tdMelhorPreco);
        
        corpoTabela.appendChild(tr);
    });
    
    atualizarMelhoresPrecos();
}

function atualizarPreco(itemIndex, fornecedorIndex, valor) {
    if (tabelaCotacao[itemIndex]) {
        if (!tabelaCotacao[itemIndex].precos) {
            tabelaCotacao[itemIndex].precos = {};
        }
        
        const precoNumerico = parseFloat(valor);
        tabelaCotacao[itemIndex].precos[fornecedorIndex] = isNaN(precoNumerico) ? '' : precoNumerico;
        
        atualizarMelhoresPrecos();
        atualizarTotais();
        salvarDadosLocais();
    }
}

function atualizarMelhoresPrecos() {
    tabelaCotacao.forEach((item, itemIndex) => {
        const tr = corpoTabela.children[itemIndex];
        if (!tr) return;
        
        const tdMelhorPreco = tr.querySelector('.melhor-preco-cell');
        if (!tdMelhorPreco) return;
        
        // Limpar classes de melhor preço
        tr.querySelectorAll('.preco-cell').forEach(td => {
            td.classList.remove('melhor-preco');
        });
        
        // Encontrar o melhor preço
        let melhorPreco = Infinity;
        let melhorFornecedorIndex = -1;
        
        Object.entries(item.precos).forEach(([fornecedorIndex, preco]) => {
            if (preco !== '' && !isNaN(preco) && preco < melhorPreco) {
                melhorPreco = preco;
                melhorFornecedorIndex = parseInt(fornecedorIndex);
            }
        });
        
        // Atualizar célula de melhor preço
        if (melhorFornecedorIndex >= 0) {
            const fornecedor = fornecedores.find(f => f.index === melhorFornecedorIndex);
            tdMelhorPreco.textContent = `R$ ${melhorPreco.toFixed(2)} (${fornecedor ? fornecedor.nome : 'Desconhecido'})`;
            
            // Destacar o melhor preço
            const tdMelhorFornecedor = tr.querySelector(`.preco-cell[data-fornecedor-index="${melhorFornecedorIndex}"]`);
            if (tdMelhorFornecedor) {
                tdMelhorFornecedor.classList.add('melhor-preco');
            }
        } else {
            tdMelhorPreco.textContent = '-';
        }
    });
}

function atualizarTotais() {
    // Calcular totais por fornecedor
    const totais = {};
    
    tabelaCotacao.forEach(item => {
        Object.entries(item.precos).forEach(([fornecedorIndex, preco]) => {
            if (preco !== '' && !isNaN(preco)) {
                const valorTotal = preco * item.quantidade;
                if (!totais[fornecedorIndex]) {
                    totais[fornecedorIndex] = 0;
                }
                totais[fornecedorIndex] += valorTotal;
            }
        });
    });
    
    // Atualizar células de total
    document.querySelectorAll('.total-col').forEach(td => {
        const fornecedorIndex = parseInt(td.dataset.index);
        const total = totais[fornecedorIndex] || 0;
        td.textContent = `R$ ${total.toFixed(2)}`;
        td.classList.remove('melhor-fornecedor');
    });
    
    // Encontrar o melhor fornecedor (menor total)
    let melhorTotal = Infinity;
    let melhorFornecedorIndex = -1;
    
    Object.entries(totais).forEach(([fornecedorIndex, total]) => {
        if (total > 0 && total < melhorTotal) {
            melhorTotal = total;
            melhorFornecedorIndex = parseInt(fornecedorIndex);
        }
    });
    
    // Destacar o melhor fornecedor
    const melhorFornecedorEl = document.getElementById('melhor-fornecedor');
    
    if (melhorFornecedorIndex >= 0) {
        const fornecedor = fornecedores.find(f => f.index === melhorFornecedorIndex);
        melhorFornecedorEl.textContent = fornecedor ? fornecedor.nome : 'Desconhecido';
        
        const tdMelhorFornecedor = document.querySelector(`.total-col[data-index="${melhorFornecedorIndex}"]`);
        if (tdMelhorFornecedor) {
            tdMelhorFornecedor.classList.add('melhor-fornecedor');
        }
    } else {
        melhorFornecedorEl.textContent = '-';
    }
}

function zerarTabela() {
    if (confirm('Tem certeza que deseja zerar a tabela de cotação? Todos os preços serão perdidos.')) {
        tabelaCotacao.forEach(item => {
            item.precos = {};
        });
        
        renderizarTabelaCotacao();
        atualizarTotais();
        salvarDadosLocais();
    }
}

// Funções para persistência local
function salvarDadosLocais() {
    localStorage.setItem('cotacao_listaItens', JSON.stringify(listaItens));
    localStorage.setItem('cotacao_tabelaCotacao', JSON.stringify(tabelaCotacao));
    localStorage.setItem('cotacao_fornecedores', JSON.stringify(fornecedores));
}

function carregarDadosLocais() {
    try {
        const listaItensLocal = localStorage.getItem('cotacao_listaItens');
        const tabelaCotacaoLocal = localStorage.getItem('cotacao_tabelaCotacao');
        const fornecedoresLocal = localStorage.getItem('cotacao_fornecedores');
        
        if (listaItensLocal) {
            listaItens = JSON.parse(listaItensLocal);
        }
        
        if (tabelaCotacaoLocal) {
            tabelaCotacao = JSON.parse(tabelaCotacaoLocal);
        }
        
        if (fornecedoresLocal) {
            fornecedores = JSON.parse(fornecedoresLocal);
        }
    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
    }
}
