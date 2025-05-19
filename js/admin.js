// Arquivo JavaScript para o painel administrativo

// Variáveis globais
let userData = null;
let inscricoesList = [];
let cmeisList = [];
let usuariosList = [];
let currentPage = 1;
let itemsPerPage = 10;
let filteredInscricoes = [];
let currentInscricaoId = null;

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    userData = auth.checkAuth();
    if (!userData) return;
    
    // Verificar se é um administrador
    if (userData.tipo !== 'admin') {
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
    
    // Carregar dados iniciais
    loadInscricoes();
    loadCMEIs();
    
    // Configurar eventos de filtro
    setupFilters();
    
    // Configurar eventos dos modais
    setupModals();
});

// Configurar navegação entre seções
function setupNavigation() {
    // Botões do menu principal
    document.getElementById('inscricoesBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('inscricoesSection');
    });
    
    document.getElementById('cmeisBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('cmeisSection');
    });
    
    document.getElementById('usuariosBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('usuariosSection');
        loadUsuarios();
    });
    
    document.getElementById('relatoriosBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('relatoriosSection');
    });
    
    // Botões da seção de boas-vindas
    document.getElementById('welcomeInscricoesBtn').addEventListener('click', function() {
        showSection('inscricoesSection');
    });
    
    document.getElementById('welcomeRelatoriosBtn').addEventListener('click', function() {
        showSection('relatoriosSection');
    });
    
    // Botão para voltar à lista de inscrições
    document.getElementById('voltarListaBtn').addEventListener('click', function() {
        showSection('inscricoesSection');
    });
}

// Função para mostrar uma seção e esconder as outras
function showSection(sectionId) {
    // Esconder todas as seções
    const sections = [
        'welcomeSection', 
        'inscricoesSection', 
        'cmeisSection', 
        'usuariosSection', 
        'relatoriosSection', 
        'detalhesInscricaoSection'
    ];
    
    sections.forEach(section => {
        document.getElementById(section).classList.add('d-none');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).classList.remove('d-none');
}

// Configurar eventos de filtro
function setupFilters() {
    // Botão de aplicar filtros
    document.getElementById('applyFiltersBtn').addEventListener('click', function() {
        applyFilters();
    });
    
    // Botão de limpar filtros
    document.getElementById('clearFiltersBtn').addEventListener('click', function() {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterCmei').value = '';
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

// Configurar eventos dos modais
function setupModals() {
    // Modal de novo CMEI
    document.getElementById('novoCmeiBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('novoCmeiModal'));
        modal.show();
    });
    
    // Modal de novo usuário
    document.getElementById('novoUsuarioBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('novoUsuarioModal'));
        modal.show();
    });
    
    // Botão de salvar CMEI
    document.getElementById('salvarCmeiBtn').addEventListener('click', function() {
        salvarCmei();
    });
    
    // Botão de salvar usuário
    document.getElementById('salvarUsuarioBtn').addEventListener('click', function() {
        salvarUsuario();
    });
    
    // Botões de aprovar/reprovar inscrição
    document.getElementById('aprovarInscricaoBtn').addEventListener('click', function() {
        atualizarStatusInscricao('Aprovado');
    });
    
    document.getElementById('reprovarInscricaoBtn').addEventListener('click', function() {
        atualizarStatusInscricao('Reprovado');
    });
    
    // Botões de relatórios
    document.getElementById('relatorioInscricoesCmeiBtn').addEventListener('click', function() {
        gerarRelatorio('inscricoes_cmei');
    });
    
    document.getElementById('relatorioInscricoesStatusBtn').addEventListener('click', function() {
        gerarRelatorio('inscricoes_status');
    });
    
    document.getElementById('relatorioInscricoesIdadeBtn').addEventListener('click', function() {
        gerarRelatorio('inscricoes_idade');
    });
    
    document.getElementById('relatorioInscricoesPrioridadeBtn').addEventListener('click', function() {
        gerarRelatorio('inscricoes_prioridade');
    });
    
    document.getElementById('relatorioInscricoesPeriodoBtn').addEventListener('click', function() {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        
        if (!dataInicio || !dataFim) {
            alert('Selecione o período para gerar o relatório.');
            return;
        }
        
        gerarRelatorio('inscricoes_periodo', { dataInicio, dataFim });
    });
    
    document.getElementById('relatorioCompletoBtn').addEventListener('click', function() {
        gerarRelatorio('completo');
    });
}

// Função para aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('filterStatus').value;
    const cmeiFilter = document.getElementById('filterCmei').value;
    const prioridadeFilter = document.getElementById('filterPrioridade').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Filtrar inscrições
    filteredInscricoes = inscricoesList.filter(inscricao => {
        // Filtro de status
        if (statusFilter && inscricao.status !== statusFilter) {
            return false;
        }
        
        // Filtro de CMEI
        if (cmeiFilter && inscricao.cmei_id !== cmeiFilter) {
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
    updateInscricoesTable();
}

// Função para carregar as inscrições
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
            updateInscricoesTable();
        } else {
            console.error('Erro ao carregar inscrições:', data.message);
            alert('Erro ao carregar inscrições. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
        alert('Erro ao carregar inscrições. Tente novamente.');
    }
}

// Função para carregar os CMEIs
async function loadCMEIs() {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=listar_cmeis&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            cmeisList = data.cmeis;
            
            // Preencher o select de CMEIs no filtro
            const cmeiSelect = document.getElementById('filterCmei');
            cmeiSelect.innerHTML = '<option value="">Todos os CMEIs</option>';
            
            cmeisList.forEach(cmei => {
                const option = document.createElement('option');
                option.value = cmei.id;
                option.textContent = cmei.nome;
                cmeiSelect.appendChild(option);
            });
            
            // Atualizar contador de CMEIs no painel de boas-vindas
            document.getElementById('totalCmeis').textContent = cmeisList.length;
            
            // Atualizar tabela de CMEIs
            updateCMEIsTable();
        } else {
            console.error('Erro ao carregar CMEIs:', data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar CMEIs:', error);
    }
}

// Função para carregar os usuários
async function loadUsuarios() {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=listar_usuarios&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            usuariosList = data.usuarios;
            
            // Atualizar tabela de usuários
            updateUsuariosTable();
            
            // Preencher o select de gestores no modal de novo CMEI
            const gestorSelect = document.getElementById('gestorCmei');
            gestorSelect.innerHTML = '<option value="">Selecione um gestor (opcional)</option>';
            
            const gestores = usuariosList.filter(usuario => usuario.tipo === 'gestor');
            gestores.forEach(gestor => {
                const option = document.createElement('option');
                option.value = gestor.id;
                option.textContent = gestor.nome;
                gestorSelect.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar usuários:', data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
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
function updateInscricoesTable() {
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
        
        // Formatar a data
        const data = new Date(inscricao.data_inscricao);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
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
            <td>${inscricao.cmei_nome}</td>
            <td>${dataFormatada}</td>
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

// Função para atualizar a tabela de CMEIs
function updateCMEIsTable() {
    const tableBody = document.getElementById('cmeisTableBody');
    
    // Verificar se há CMEIs
    if (cmeisList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum CMEI encontrado.</td></tr>';
        return;
    }
    
    // Preencher a tabela com os CMEIs
    tableBody.innerHTML = '';
    cmeisList.forEach(cmei => {
        const row = document.createElement('tr');
        
        // Buscar nome do gestor
        let gestorNome = 'Não atribuído';
        if (cmei.gestor_id) {
            const gestor = usuariosList.find(u => u.id === cmei.gestor_id);
            if (gestor) {
                gestorNome = gestor.nome;
            }
        }
        
        row.innerHTML = `
            <td>${cmei.nome}</td>
            <td>${cmei.endereco}, ${cmei.bairro}</td>
            <td>${cmei.capacidade_total}</td>
            <td>${cmei.vagas_disponiveis}</td>
            <td>${gestorNome}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-cmei" data-id="${cmei.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar evento aos botões de editar
    document.querySelectorAll('.edit-cmei').forEach(button => {
        button.addEventListener('click', function() {
            const cmeiId = this.getAttribute('data-id');
            editCmei(cmeiId);
        });
    });
}

// Função para atualizar a tabela de usuários
function updateUsuariosTable() {
    const tableBody = document.getElementById('usuariosTableBody');
    
    // Verificar se há usuários
    if (usuariosList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum usuário encontrado.</td></tr>';
        return;
    }
    
    // Preencher a tabela com os usuários
    tableBody.innerHTML = '';
    usuariosList.forEach(usuario => {
        const row = document.createElement('tr');
        
        // Formatar CPF
        const cpf = usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        
        // Formatar tipo de usuário
        let tipoUsuario = '';
        switch (usuario.tipo) {
            case 'admin':
                tipoUsuario = 'Administrador';
                break;
            case 'gestor':
                tipoUsuario = 'Gestor';
                break;
            case 'responsavel':
                tipoUsuario = 'Responsável';
                break;
            default:
                tipoUsuario = usuario.tipo;
        }
        
        // Formatar status
        const status = usuario.ativo === 'true' ? 'Ativo' : 'Inativo';
        const statusClass = usuario.ativo === 'true' ? 'text-success' : 'text-danger';
        
        row.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${cpf}</td>
            <td>${tipoUsuario}</td>
            <td>${usuario.telefone || '-'}</td>
            <td class="${statusClass}">${status}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-usuario" data-id="${usuario.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-${usuario.ativo === 'true' ? 'danger' : 'success'} toggle-status" data-id="${usuario.id}" data-status="${usuario.ativo}">
                    <i class="fas fa-${usuario.ativo === 'true' ? 'ban' : 'check'}"></i> ${usuario.ativo === 'true' ? 'Desativar' : 'Ativar'}
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar evento aos botões de editar e ativar/desativar
    document.querySelectorAll('.edit-usuario').forEach(button => {
        button.addEventListener('click', function() {
            const usuarioId = this.getAttribute('data-id');
            editUsuario(usuarioId);
        });
    });
    
    document.querySelectorAll('.toggle-status').forEach(button => {
        button.addEventListener('click', function() {
            const usuarioId = this.getAttribute('data-id');
            const status = this.getAttribute('data-status');
            toggleUsuarioStatus(usuarioId, status);
        });
    });
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
            updateInscricoesTable();
            
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
            currentInscricaoId = inscricaoId;
            
            // Preencher os campos de detalhes
            document.getElementById('detNomeCrianca').textContent = detalhes.crianca.nome;
            
            // Formatar a data de nascimento
            const dataNasc = new Date(detalhes.crianca.data_nascimento);
            document.getElementById('detDataNascimento').textContent = dataNasc.toLocaleDateString('pt-BR');
            
            document.getElementById('detSexo').textContent = detalhes.crianca.sexo === 'M' ? 'Masculino' : 'Feminino';
            document.getElementById('detBolsaFamilia').textContent = detalhes.crianca.bolsa_familia === 'true' ? 'Sim' : 'Não';
            
            document.getElementById('detCmei').textContent = detalhes.cmei.nome;
            
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
            document.getElementById('detCpfResponsavel').textContent = detalhes.responsavel ? formatarCPF(detalhes.responsavel.cpf) : 'Não informado';
            
            // Observações
            document.getElementById('detObservacoes').textContent = detalhes.inscricao.observacoes || 'Sem observações.';
            
            // Mostrar/ocultar botões de ação com base no status
            const aprovarBtn = document.getElementById('aprovarInscricaoBtn');
            const reprovarBtn = document.getElementById('reprovarInscricaoBtn');
            
            if (detalhes.inscricao.status === 'Aguardando análise') {
                aprovarBtn.classList.remove('d-none');
                reprovarBtn.classList.remove('d-none');
            } else {
                aprovarBtn.classList.add('d-none');
                reprovarBtn.classList.add('d-none');
            }
            
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

// Função para atualizar o status de uma inscrição
async function atualizarStatusInscricao(status) {
    if (!currentInscricaoId) {
        alert('Erro: ID da inscrição não encontrado.');
        return;
    }
    
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const data = {
            action: 'atualizar_status',
            token: token,
            id: currentInscricaoId,
            status: status
        };
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            alert(`Inscrição ${status.toLowerCase()} com sucesso!`);
            
            // Atualizar a lista de inscrições
            loadInscricoes();
            
            // Voltar para a lista
            showSection('inscricoesSection');
        } else {
            console.error('Erro ao atualizar status:', responseData.message);
            alert('Erro ao atualizar status. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Tente novamente.');
    }
}

// Função para salvar um novo CMEI
async function salvarCmei() {
    // Obter dados do formulário
    const nome = document.getElementById('nomeCmei').value;
    const endereco = document.getElementById('enderecoCmei').value;
    const bairro = document.getElementById('bairroCmei').value;
    const cep = document.getElementById('cepCmei').value;
    const geolocalizacao = document.getElementById('geolocalizacaoCmei').value;
    const capacidade = document.getElementById('capacidadeCmei').value;
    const vagas = document.getElementById('vagasCmei').value;
    const gestorId = document.getElementById('gestorCmei').value;
    
    // Validar campos obrigatórios
    if (!nome || !endereco || !bairro || !cep || !geolocalizacao || !capacidade || !vagas) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }
    
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const data = {
            action: 'novo_cmei',
            token: token,
            nome: nome,
            endereco: endereco,
            bairro: bairro,
            cep: cep,
            geolocalizacao: geolocalizacao,
            capacidade_total: capacidade,
            vagas_disponiveis: vagas,
            gestor_id: gestorId
        };
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            alert('CMEI cadastrado com sucesso!');
            
            // Fechar o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novoCmeiModal'));
            modal.hide();
            
            // Limpar o formulário
            document.getElementById('novoCmeiForm').reset();
            
            // Atualizar a lista de CMEIs
            loadCMEIs();
        } else {
            console.error('Erro ao cadastrar CMEI:', responseData.message);
            alert('Erro ao cadastrar CMEI. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar CMEI:', error);
        alert('Erro ao cadastrar CMEI. Tente novamente.');
    }
}

// Função para salvar um novo usuário
async function salvarUsuario() {
    // Obter dados do formulário
    const nome = document.getElementById('nomeUsuario').value;
    const cpf = document.getElementById('cpfUsuario').value.replace(/\D/g, '');
    const telefone = document.getElementById('telefoneUsuario').value;
    const email = document.getElementById('emailUsuario').value;
    const tipo = document.getElementById('tipoUsuario').value;
    const senha = document.getElementById('senhaUsuario').value;
    const confirmarSenha = document.getElementById('confirmarSenhaUsuario').value;
    
    // Validar campos obrigatórios
    if (!nome || !cpf || !telefone || !tipo || !senha) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar CPF
    if (cpf.length !== 11) {
        alert('CPF inválido. Digite os 11 dígitos.');
        return;
    }
    
    // Validar senha
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
    }
    
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const data = {
            action: 'register',
            token: token,
            name: nome,
            cpf: cpf,
            phone: telefone,
            email: email,
            tipo: tipo,
            password: senha
        };
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            alert('Usuário cadastrado com sucesso!');
            
            // Fechar o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novoUsuarioModal'));
            modal.hide();
            
            // Limpar o formulário
            document.getElementById('novoUsuarioForm').reset();
            
            // Atualizar a lista de usuários
            loadUsuarios();
        } else {
            console.error('Erro ao cadastrar usuário:', responseData.message);
            alert('Erro ao cadastrar usuário. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        alert('Erro ao cadastrar usuário. Tente novamente.');
    }
}

// Função para editar um CMEI
function editCmei(cmeiId) {
    // Buscar o CMEI pelo ID
    const cmei = cmeisList.find(c => c.id === cmeiId);
    if (!cmei) {
        alert('CMEI não encontrado.');
        return;
    }
    
    // Preencher o formulário com os dados do CMEI
    document.getElementById('nomeCmei').value = cmei.nome;
    document.getElementById('enderecoCmei').value = cmei.endereco;
    document.getElementById('bairroCmei').value = cmei.bairro;
    document.getElementById('cepCmei').value = cmei.cep;
    document.getElementById('geolocalizacaoCmei').value = cmei.geolocalizacao;
    document.getElementById('capacidadeCmei').value = cmei.capacidade_total;
    document.getElementById('vagasCmei').value = cmei.vagas_disponiveis;
    document.getElementById('gestorCmei').value = cmei.gestor_id || '';
    
    // Abrir o modal
    const modal = new bootstrap.Modal(document.getElementById('novoCmeiModal'));
    modal.show();
    
    // Alterar o título do modal
    document.getElementById('novoCmeiModalLabel').textContent = 'Editar CMEI';
    
    // Alterar o comportamento do botão de salvar
    const salvarBtn = document.getElementById('salvarCmeiBtn');
    salvarBtn.textContent = 'Atualizar';
    
    // Remover eventos anteriores
    salvarBtn.replaceWith(salvarBtn.cloneNode(true));
    
    // Adicionar novo evento
    document.getElementById('salvarCmeiBtn').addEventListener('click', function() {
        atualizarCmei(cmeiId);
    });
}

// Função para editar um usuário
function editUsuario(usuarioId) {
    // Buscar o usuário pelo ID
    const usuario = usuariosList.find(u => u.id === usuarioId);
    if (!usuario) {
        alert('Usuário não encontrado.');
        return;
    }
    
    // Preencher o formulário com os dados do usuário
    document.getElementById('nomeUsuario').value = usuario.nome;
    document.getElementById('cpfUsuario').value = usuario.cpf;
    document.getElementById('telefoneUsuario').value = usuario.telefone || '';
    document.getElementById('emailUsuario').value = usuario.email || '';
    document.getElementById('tipoUsuario').value = usuario.tipo;
    
    // Limpar campos de senha
    document.getElementById('senhaUsuario').value = '';
    document.getElementById('confirmarSenhaUsuario').value = '';
    
    // Abrir o modal
    const modal = new bootstrap.Modal(document.getElementById('novoUsuarioModal'));
    modal.show();
    
    // Alterar o título do modal
    document.getElementById('novoUsuarioModalLabel').textContent = 'Editar Usuário';
    
    // Alterar o comportamento do botão de salvar
    const salvarBtn = document.getElementById('salvarUsuarioBtn');
    salvarBtn.textContent = 'Atualizar';
    
    // Remover eventos anteriores
    salvarBtn.replaceWith(salvarBtn.cloneNode(true));
    
    // Adicionar novo evento
    document.getElementById('salvarUsuarioBtn').addEventListener('click', function() {
        atualizarUsuario(usuarioId);
    });
}

// Função para atualizar um CMEI
async function atualizarCmei(cmeiId) {
    // Obter dados do formulário
    const nome = document.getElementById('nomeCmei').value;
    const endereco = document.getElementById('enderecoCmei').value;
    const bairro = document.getElementById('bairroCmei').value;
    const cep = document.getElementById('cepCmei').value;
    const geolocalizacao = document.getElementById('geolocalizacaoCmei').value;
    const capacidade = document.getElementById('capacidadeCmei').value;
    const vagas = document.getElementById('vagasCmei').value;
    const gestorId = document.getElementById('gestorCmei').value;
    
    // Validar campos obrigatórios
    if (!nome || !endereco || !bairro || !cep || !geolocalizacao || !capacidade || !vagas) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }
    
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const data = {
            action: 'atualizar_cmei',
            token: token,
            id: cmeiId,
            nome: nome,
            endereco: endereco,
            bairro: bairro,
            cep: cep,
            geolocalizacao: geolocalizacao,
            capacidade_total: capacidade,
            vagas_disponiveis: vagas,
            gestor_id: gestorId
        };
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            alert('CMEI atualizado com sucesso!');
            
            // Fechar o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novoCmeiModal'));
            modal.hide();
            
            // Limpar o formulário
            document.getElementById('novoCmeiForm').reset();
            
            // Restaurar o título do modal
            document.getElementById('novoCmeiModalLabel').textContent = 'Novo CMEI';
            
            // Restaurar o comportamento do botão de salvar
            const salvarBtn = document.getElementById('salvarCmeiBtn');
            salvarBtn.textContent = 'Salvar';
            
            // Remover eventos anteriores
            salvarBtn.replaceWith(salvarBtn.cloneNode(true));
            
            // Adicionar evento original
            document.getElementById('salvarCmeiBtn').addEventListener('click', function() {
                salvarCmei();
            });
            
            // Atualizar a lista de CMEIs
            loadCMEIs();
        } else {
            console.error('Erro ao atualizar CMEI:', responseData.message);
            alert('Erro ao atualizar CMEI. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao atualizar CMEI:', error);
        alert('Erro ao atualizar CMEI. Tente novamente.');
    }
}

// Função para atualizar um usuário
async function atualizarUsuario(usuarioId) {
    // Obter dados do formulário
    const nome = document.getElementById('nomeUsuario').value;
    const cpf = document.getElementById('cpfUsuario').value.replace(/\D/g, '');
    const telefone = document.getElementById('telefoneUsuario').value;
    const email = document.getElementById('emailUsuario').value;
    const tipo = document.getElementById('tipoUsuario').value;
    const senha = document.getElementById('senhaUsuario').value;
    const confirmarSenha = document.getElementById('confirmarSenhaUsuario').value;
    
    // Validar campos obrigatórios
    if (!nome || !cpf || !telefone || !tipo) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar CPF
    if (cpf.length !== 11) {
        alert('CPF inválido. Digite os 11 dígitos.');
        return;
    }
    
    // Validar senha (apenas se for informada)
    if (senha && senha !== confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
    }
    
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const data = {
            action: 'atualizar_usuario',
            token: token,
            id: usuarioId,
            name: nome,
            cpf: cpf,
            phone: telefone,
            email: email,
            tipo: tipo
        };
        
        // Adicionar senha apenas se for informada
        if (senha) {
            data.password = senha;
        }
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            alert('Usuário atualizado com sucesso!');
            
            // Fechar o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('novoUsuarioModal'));
            modal.hide();
            
            // Limpar o formulário
            document.getElementById('novoUsuarioForm').reset();
            
            // Restaurar o título do modal
            document.getElementById('novoUsuarioModalLabel').textContent = 'Novo Usuário';
            
            // Restaurar o comportamento do botão de salvar
            const salvarBtn = document.getElementById('salvarUsuarioBtn');
            salvarBtn.textContent = 'Salvar';
            
            // Remover eventos anteriores
            salvarBtn.replaceWith(salvarBtn.cloneNode(true));
            
            // Adicionar evento original
            document.getElementById('salvarUsuarioBtn').addEventListener('click', function() {
                salvarUsuario();
            });
            
            // Atualizar a lista de usuários
            loadUsuarios();
        } else {
            console.error('Erro ao atualizar usuário:', responseData.message);
            alert('Erro ao atualizar usuário. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário. Tente novamente.');
    }
}

// Função para ativar/desativar um usuário
async function toggleUsuarioStatus(usuarioId, status) {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const data = {
            action: 'toggle_usuario_status',
            token: token,
            id: usuarioId,
            ativo: status === 'true' ? 'false' : 'true'
        };
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            alert(`Usuário ${status === 'true' ? 'desativado' : 'ativado'} com sucesso!`);
            
            // Atualizar a lista de usuários
            loadUsuarios();
        } else {
            console.error('Erro ao alterar status do usuário:', responseData.message);
            alert('Erro ao alterar status do usuário. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        alert('Erro ao alterar status do usuário. Tente novamente.');
    }
}

// Função para gerar relatórios
function gerarRelatorio(tipo, params = {}) {
    alert(`Relatório de ${tipo} seria gerado aqui.`);
    // Esta função seria implementada para gerar relatórios em PDF ou Excel
    // Utilizando a API do Google Apps Script
}

// Função para formatar CPF
function formatarCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
