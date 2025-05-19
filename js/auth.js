// Arquivo de autenticação e gerenciamento de usuários

// Variáveis globais
const API_URL = "https://script.google.com/macros/s/AKfycbwPJk8gyC3WNXfU8k7XiPqsZ6cEJlpuY7vnTsRkttDTkwGO9UsetmmQ5tISQyLUkhNlrA/exec"; // Será preenchido com a URL do Apps Script publicado
const TOKEN_KEY = "vagou_token";
const USER_DATA_KEY = "vagou_user";

// Função para inicializar a página de login
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já existe um token válido
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}");
    
    if (token && userData.tipo) {
        // Redirecionar para o painel apropriado
        redirectToDashboard(userData.tipo);
        return;
    }
    
    // Configurar eventos do formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Configurar evento para mostrar/ocultar senha
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="fa fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="fa fa-eye"></i>';
            }
        });
    }
    
    // Configurar evento para abrir modal de cadastro
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        });
    }
    
    // Configurar evento para o botão de cadastro
    const submitRegister = document.getElementById('submitRegister');
    if (submitRegister) {
        submitRegister.addEventListener('click', handleRegister);
    }
    
    // Configurar máscaras para CPF e telefone
    const cpfInputs = document.querySelectorAll('#cpf, #regCpf');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 11);
        });
    });
    
    const phoneInput = document.getElementById('regPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 2) {
                value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
            }
            if (value.length > 10) {
                value = value.substring(0, 10) + '-' + value.substring(10);
            }
            
            this.value = value;
        });
    }
});

// Função para lidar com o login
async function handleLogin(e) {
    e.preventDefault();
    
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Validar campos
    if (!cpf || cpf.length !== 11) {
        showError(errorElement, 'CPF inválido. Digite os 11 dígitos.');
        return;
    }
    
    if (!password) {
        showError(errorElement, 'Digite sua senha.');
        return;
    }
    
    // Mostrar indicador de carregamento
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Aguarde...';
    
    try {
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                cpf: cpf,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salvar token e dados do usuário
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
            
            // Redirecionar para o painel apropriado
            redirectToDashboard(data.user.tipo);
        } else {
            showError(errorElement, data.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showError(errorElement, 'Erro de conexão. Tente novamente mais tarde.');
    } finally {
        // Restaurar botão
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Função para lidar com o cadastro
async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const cpf = document.getElementById('regCpf').value.replace(/\D/g, '');
    const phone = document.getElementById('regPhone').value.replace(/\D/g, '');
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const errorElement = document.getElementById('registerError');
    
    // Validar campos
    if (!name) {
        showError(errorElement, 'Digite seu nome completo.');
        return;
    }
    
    if (!cpf || cpf.length !== 11) {
        showError(errorElement, 'CPF inválido. Digite os 11 dígitos.');
        return;
    }
    
    if (!phone || phone.length < 10) {
        showError(errorElement, 'Telefone inválido.');
        return;
    }
    
    if (!password) {
        showError(errorElement, 'Digite uma senha.');
        return;
    }
    
    if (password !== passwordConfirm) {
        showError(errorElement, 'As senhas não coincidem.');
        return;
    }
    
    // Mostrar indicador de carregamento
    const submitButton = document.getElementById('submitRegister');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Aguarde...';
    
    try {
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'register',
                name: name,
                cpf: cpf,
                phone: phone,
                password: password,
                tipo: 'responsavel' // Tipo padrão para novos cadastros
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Fechar modal
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            
            // Mostrar mensagem de sucesso
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            
            // Preencher o campo de CPF no formulário de login
            document.getElementById('cpf').value = cpf;
            document.getElementById('password').focus();
        } else {
            showError(errorElement, data.message || 'Erro ao fazer cadastro.');
        }
    } catch (error) {
        console.error('Erro ao fazer cadastro:', error);
        showError(errorElement, 'Erro de conexão. Tente novamente mais tarde.');
    } finally {
        // Restaurar botão
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Função para redirecionar para o painel apropriado
function redirectToDashboard(userType) {
    switch (userType) {
        case 'admin':
            window.location.href = 'pages/admin.html';
            break;
        case 'gestor':
            window.location.href = 'pages/gestor.html';
            break;
        case 'responsavel':
            window.location.href = 'pages/responsavel.html';
            break;
        default:
            // Tipo desconhecido, fazer logout
            logout();
    }
}

// Função para fazer logout
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    window.location.href = '../index.html';
}

// Função para mostrar mensagem de erro
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('d-none');
    
    // Esconder a mensagem após 5 segundos
    setTimeout(() => {
        element.classList.add('d-none');
    }, 5000);
}

// Função para verificar autenticação (usada em todas as páginas protegidas)
function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}");
    
    if (!token || !userData.tipo) {
        // Redirecionar para a página de login
        window.location.href = '../index.html';
        return null;
    }
    
    return userData;
}

// Função para obter o token de autenticação
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Exportar funções para uso em outros arquivos
window.auth = {
    logout,
    checkAuth,
    getAuthToken
};
