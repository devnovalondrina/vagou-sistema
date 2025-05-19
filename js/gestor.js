// Arquivo JavaScript para o painel do gestor

// Variáveis globais
let userData = null;
let inscricoesList = [];
let currentPage = 1;
let itemsPerPage = 10;
let filteredInscricoes = [];

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    userData = auth.checkAuth();
    if (!userData) return;
    
    // Verificar se é um gestor
    if (userData.tipo !== 'gestor') {
        alert('Acesso não autorizado. Você será redirecionado.');
        auth.logout();
        return;
    }
    
    // Exibir nome do usuário
    document.getElementById('userNameDisplay').textContent = userData.nome;
    
    // Configurar evento de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        auth.logout();
    });
    
    // Configurar navegação
    setupNavigation();
    
    // Carregar inscrições do CMEI
    loadInscricoes();
    
    // Configurar eventos de filtro
    setupFilters();
});

// Configurar navegação entre seções
function setupNavigation() {
    // Botões do menu principal
    document.getElementById('inscricoesBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('inscricoesSection');
    });
    
    document.getElementById('estatisticasBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('estatisticasSection');
    });
    
    // Botão da seção de boas-vindas
    document.getElementById('welcomeInscricoesBtn').addEventListener('click', function() {
        showSection('inscricoesSection');
    });
    
    // Botão para voltar à lista de inscrições
    document.getElementById('voltarListaBtn').addEventListener('click', function() {
        showSection('inscricoesSection');
    });
}

// Função para mostrar uma seção e esconder as outras
function showSection(sectionId) {
    // Esconder todas as seções
    const sections = ['welcomeSection', 'inscricoesSection', 'estatisticasSection', 'detalhesInscricaoSection'];
    sections.forEach(section => {
        document.getElementById(section).classList.add('d-none');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Se for a seção de inscrições, recarregar a lista
    if (sectionId === 'inscricoesSection') {
        loadInscricoes();
    }
    
    // Se for a seção de estatísticas, carregar os dados
    if (sectionId === 'estatisticasSection') {
        loadEstatisticas();
    }
}

// Função para configurar eventos de filtro
function setupFilters() {
    // Botão de aplicar filtros
    document.getElementById('applyFiltersBtn').addEventListener('click', function() {
        applyFilters();
    });
    
    // Botão de limpar filtros
    document.getElementById('clearFiltersBtn').addEventListener('click', function() {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPrioridade').value = '';
        document.getElementById('searchInput').value = '';
        applyFilters();
    });
    
    // Botão de busca
    document.getElementById('searchBtn').addEventListener('click', function() {
        applyFilters();
    });
    
    // Evento de tecla Enter no campo de busca
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

// Função para aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('filterStatus').value;
    const prioridadeFilter = document.getElementById('filterPrioridade').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Filtrar inscrições
    filteredInscricoes = inscricoesList.filter(inscricao => {
        // Filtro de status
        if (statusFilter && inscricao.status !== statusFilter) {
            return false;
        }
        
        // Filtro de prioridade
        if (prioridadeFilter && inscricao.prioridade !== prioridadeFilter) {
            return false;
        }
        
        // Filtro de busca
        if (searchTerm) {
            const criancaNome = inscricao.crianca_nome.toLowerCase();
            return criancaNome.includes(searchTerm);
        }
        
        return true;
    });
    
    // Resetar paginação
    currentPage = 1;
    
    // Atualizar tabela
    updateTable();
}

// Função para carregar as inscrições do CMEI
async function loadInscricoes() {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=listar_inscricoes&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            inscricoesList = data.inscricoes;
            filteredInscricoes = [...inscricoesList];
            
            // Atualizar contadores no painel de boas-vindas
            updateCounters();
            
            // Atualizar tabela
            updateTable();
        } else {
            console.error('Erro ao carregar inscrições:', data.message);
            alert('Erro ao carregar inscrições. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
        alert('Erro ao carregar inscrições. Tente novamente.');
    }
}

// Função para atualizar contadores no painel de boas-vindas
function updateCounters() {
    const total = inscricoesList.length;
    const aguardando = inscricoesList.filter(i => i.status === 'Aguardando análise').length;
    const aprovadas = inscricoesList.filter(i => i.status === 'Aprovado').length;
    
    document.getElementById('totalInscricoes').textContent = total;
    document.getElementById('aguardandoAnalise').textContent = aguardando;
    document.getElementById('inscricoesAprovadas').textContent = aprovadas;
}

// Função para atualizar a tabela de inscrições
function updateTable() {
    const tableBody = document.getElementById('inscricoesTableBody');
    
    // Verificar se há inscrições
    if (filteredInscricoes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma inscrição encontrada.</td></tr>';
        document.getElementById('pagination').classList.add('d-none');
        return;
    }
    
    // Calcular paginação
    const totalPages = Math.ceil(filteredInscricoes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredInscricoes.length);
    const currentInscricoes = filteredInscricoes.slice(startIndex, endIndex);
    
    // Preencher a tabela com as inscrições
    tableBody.innerHTML = '';
    currentInscricoes.forEach(inscricao => {
        const row = document.createElement('tr');
        
        // Formatar as datas
        const dataNasc = new Date(inscricao.data_nascimento || '2000-01-01');
        const dataInsc = new Date(inscricao.data_inscricao);
        
        // Definir classe para o status
        let statusClass = '';
        switch (inscricao.status) {
            case 'Aprovado':
                statusClass = 'status-aprovado';
                break;
            case 'Reprovado':
                statusClass = 'status-reprovado';
                break;
            default:
                statusClass = 'status-aguardando';
        }
        
        // Definir texto da prioridade
        let prioridadeText = '';
        switch (inscricao.prioridade) {
            case '1':
                prioridadeText = 'Alta (1)';
                break;
            case '2':
                prioridadeText = 'Média (2)';
                break;
            case '3':
                prioridadeText = 'Baixa (3)';
                break;
            default:
                prioridadeText = 'Não definida';
        }
        
        row.innerHTML = `
            <td>${inscricao.crianca_nome}</td>
            <td>${dataNasc.toLocaleDateString('pt-BR')}</td>
            <td>${dataInsc.toLocaleDateString('pt-BR')}</td>
            <td>${prioridadeText}</td>
            <td><span class="status-badge ${statusClass}">${inscricao.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-details" data-id="${inscricao.id}">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar evento aos botões de detalhes
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const inscricaoId = this.getAttribute('data-id');
            viewInscricaoDetails(inscricaoId);
        });
    });
    
    // Atualizar paginação
    updatePagination(totalPages);
}

// Função para atualizar a paginação
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.classList.add('d-none');
        return;
    }
    
    pagination.classList.remove('d-none');
    
    // Criar links de paginação
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
        </li>
    `;
    
    // Mostrar no máximo 5 páginas
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Próximo</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Adicionar eventos aos links de paginação
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.parentElement.classList.contains('disabled')) {
                return;
            }
            
            const page = parseInt(this.getAttribute('data-page'));
            currentPage = page;
            updateTable();
            
            // Rolar para o topo da tabela
            document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Função para visualizar detalhes de uma inscrição
async function viewInscricaoDetails(inscricaoId) {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=detalhes_inscricao&id=${inscricaoId}&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            const detalhes = data;
            
            // Preencher os campos de detalhes
            document.getElementById('detNomeCrianca').textContent = detalhes.crianca.nome;
            
            // Formatar a data de nascimento
            const dataNasc = new Date(detalhes.crianca.data_nascimento);
            document.getElementById('detDataNascimento').textContent = dataNasc.toLocaleDateString('pt-BR');
            
            document.getElementById('detSexo').textContent = detalhes.crianca.sexo === 'M' ? 'Masculino' : 'Feminino';
            document.getElementById('detBolsaFamilia').textContent = detalhes.crianca.bolsa_familia === 'true' ? 'Sim' : 'Não';
            
            // Formatar a data de inscrição
            const dataInsc = new Date(detalhes.inscricao.data_inscricao);
            document.getElementById('detDataInscricao').textContent = dataInsc.toLocaleDateString('pt-BR');
            
            document.getElementById('detStatus').textContent = detalhes.inscricao.status;
            
            // Definir texto da prioridade
            let prioridadeText = '';
            switch (detalhes.inscricao.prioridade) {
                case '1':
                    prioridadeText = 'Alta (1)';
                    break;
                case '2':
                    prioridadeText = 'Média (2)';
                    break;
                case '3':
                    prioridadeText = 'Baixa (3)';
                    break;
                default:
                    prioridadeText = 'Não definida';
            }
            document.getElementById('detPrioridade').textContent = prioridadeText;
            
            document.getElementById('detDistancia').textContent = detalhes.inscricao.distancia_km;
            
            // Dados do responsável
            document.getElementById('detNomeResponsavel').textContent = detalhes.responsavel ? detalhes.responsavel.nome : 'Não informado';
            document.getElementById('detTelefoneResponsavel').textContent = detalhes.responsavel ? detalhes.responsavel.telefone : 'Não informado';
            
            // Observações
            document.getElementById('detObservacoes').textContent = detalhes.inscricao.observacoes || 'Sem observações.';
            
            // Mostrar a seção de detalhes
            showSection('detalhesInscricaoSection');
        } else {
            console.error('Erro ao carregar detalhes da inscrição:', data.message);
            alert('Erro ao carregar detalhes da inscrição. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da inscrição:', error);
        alert('Erro ao carregar detalhes da inscrição. Tente novamente.');
    }
}

// Função para carregar estatísticas
function loadEstatisticas() {
    // Contar inscrições por status
    const aguardando = inscricoesList.filter(i => i.status === 'Aguardando análise').length;
    const aprovadas = inscricoesList.filter(i => i.status === 'Aprovado').length;
    const reprovadas = inscricoesList.filter(i => i.status === 'Reprovado').length;
    
    // Contar inscrições por prioridade
    const prioridade1 = inscricoesList.filter(i => i.prioridade === '1').length;
    const prioridade2 = inscricoesList.filter(i => i.prioridade === '2').length;
    const prioridade3 = inscricoesList.filter(i => i.prioridade === '3').length;
    
    // Atualizar contadores
    document.getElementById('statAguardando').textContent = aguardando;
    document.getElementById('statAprovadas').textContent = aprovadas;
    document.getElementById('statReprovadas').textContent = reprovadas;
    
    document.getElementById('statPrioridade1').textContent = prioridade1;
    document.getElementById('statPrioridade2').textContent = prioridade2;
    document.getElementById('statPrioridade3').textContent = prioridade3;
}
