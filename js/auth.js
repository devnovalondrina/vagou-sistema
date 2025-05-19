// Arquivo de autenticação e gerenciamento de usuários

// URL da API (Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbwPJk8gyC3WNXfU8k7XiPqsZ6cEJlpuY7vnTsRkttDTkwGO9UsetmmQ5tISQyLUkhNlrA/exec";

// Objeto para gerenciar autenticação
const auth = {
    // Verificar se o usuário está autenticado
    checkAuth: function( ) {
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            // Se não estiver na página de login, redirecionar
            if (!window.location.href.includes('index.html') && !window.location.href.endsWith('/')) {
                window.location.href = '../index.html';
            }
            return null;
        }
        
        try {
            // Verificar se os dados são válidos
            const user = JSON.parse(userData);
            
            // Verificar tipo de usuário e redirecionar para a página correta se necessário
            const currentPage = window.location.pathname.split('/').pop();
            
            if (currentPage === 'index.html' || window.location.pathname.endsWith('/')) {
                // Redirecionar para a página correta com base no tipo de usuário
                switch (user.tipo) {
                    case 'admin':
                        window.location.href = 'pages/admin.html';
                        break;
                    case 'gestor':
                        window.location.href = 'pages/gestor.html';
                        break;
                    case 'responsavel':
                        window.location.href = 'pages/responsavel.html';
                        break;
                }
                return null;
            } else {
                // Verificar se o usuário está na página correta
                const isAdminPage = currentPage === 'admin.html';
                const isGestorPage = currentPage === 'gestor.html';
                const isResponsavelPage = currentPage === 'responsavel.html';
                
                if ((isAdminPage && user.tipo !== 'admin') ||
                    (isGestorPage && user.tipo !== 'gestor') ||
                    (isResponsavelPage && user.tipo !== 'responsavel')) {
                    // Redirecionar para a página correta
                    switch (user.tipo) {
                        case 'admin':
                            window.location.href = 'admin.html';
                            break;
                        case 'gestor':
                            window.location.href = 'gestor.html';
                            break;
                        case 'responsavel':
                            window.location.href = 'responsavel.html';
                            break;
                    }
                    return null;
                }
            }
            
            return user;
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.logout();
            return null;
        }
    },
    
    // Obter token de autenticação
    getAuthToken: function() {
        return localStorage.getItem('token');
    },
    
    // Fazer logout
    logout: function() {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = window.location.href.includes('/pages/') ? '../index.html' : 'index.html';
    }
};

// Configurar eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado");
    
    // Verificar se estamos na página de login
    const isLoginPage = window.location.href.includes('index.html') || window.location.pathname.endsWith('/');
    
    if (isLoginPage) {
        console.log("Estamos na página de login");
        
        // Configurar formulário de login
        const loginForm = document.getElementById('loginForm');
        console.log("Formulário de login:", loginForm);
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log("Formulário de login enviado");
                
                // Obter dados do formulário
                const cpfInput = document.getElementById('loginCpf');
                const passwordInput = document.getElementById('loginPassword');
                
                if (!cpfInput || !passwordInput) {
                    console.error("Elementos do formulário não encontrados");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                    return;
                }
                
                const cpf = cpfInput.value.replace(/\D/g, '');
                const password = passwordInput.value;
                
                // Validar campos
                if (!cpf || !password) {
                    alert('Por favor, preencha todos os campos.');
                    return;
                }
                
                // Mostrar loading
                const loginBtn = document.getElementById('loginBtn');
                if (loginBtn) {
                    const originalText = loginBtn.innerHTML;
                    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
                    loginBtn.disabled = true;
                    
                    // Restaurar botão em caso de erro
                    const restoreButton = function() {
                        loginBtn.innerHTML = originalText;
                        loginBtn.disabled = false;
                    };
                    
                    // Fazer login
                    login(cpf, password, function(success, message, data) {
                        if (success) {
                            // Salvar dados do usuário e token
                            localStorage.setItem('userData', JSON.stringify(data.user));
                            localStorage.setItem('token', data.token);
                            
                            // Redirecionar para a página correta
                            switch (data.user.tipo) {
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
                                    window.location.href = 'pages/responsavel.html';
                            }
                        } else {
                            alert(message || 'Erro ao fazer login. Tente novamente.');
                            restoreButton();
                        }
                    }, function(error) {
                        console.error('Erro ao fazer login:', error);
                        alert('Erro de conexão. Tente novamente mais tarde.');
                        restoreButton();
                    });
                } else {
                    console.error("Botão de login não encontrado");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                }
            });
        }
        
        // Configurar formulário de cadastro
        const registerForm = document.getElementById('registerForm');
        console.log("Formulário de cadastro:", registerForm);
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log("Formulário de cadastro enviado");
                
                // Obter dados do formulário
                const nameInput = document.getElementById('registerName');
                const cpfInput = document.getElementById('registerCpf');
                const phoneInput = document.getElementById('registerPhone');
                const emailInput = document.getElementById('registerEmail');
                const passwordInput = document.getElementById('registerPassword');
                const confirmPasswordInput = document.getElementById('registerConfirmPassword');
                
                if (!nameInput || !cpfInput || !phoneInput || !passwordInput || !confirmPasswordInput) {
                    console.error("Elementos do formulário não encontrados");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                    return;
                }
                
                const name = nameInput.value;
                const cpf = cpfInput.value.replace(/\D/g, '');
                const phone = phoneInput.value;
                const email = emailInput ? emailInput.value : '';
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                // Validar campos
                if (!name || !cpf || !phone || !password || !confirmPassword) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                if (password !== confirmPassword) {
                    alert('As senhas não coincidem.');
                    return;
                }
                
                // Mostrar loading
                const registerBtn = document.getElementById('registerBtn');
                if (registerBtn) {
                    const originalText = registerBtn.innerHTML;
                    registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';
                    registerBtn.disabled = true;
                    
                    // Restaurar botão em caso de erro
                    const restoreButton = function() {
                        registerBtn.innerHTML = originalText;
                        registerBtn.disabled = false;
                    };
                    
                    // Fazer cadastro
                    register(name, cpf, phone, email, password, function(success, message) {
                        if (success) {
                            alert('Cadastro realizado com sucesso! Faça login para continuar.');
                            
                            // Mostrar formulário de login
                            const loginContainer = document.getElementById('loginContainer');
                            const registerContainer = document.getElementById('registerContainer');
                            
                            if (loginContainer && registerContainer) {
                                registerContainer.classList.add('d-none');
                                loginContainer.classList.remove('d-none');
                            }
                            
                            // Limpar formulário
                            registerForm.reset();
                        } else {
                            alert(message || 'Erro ao fazer cadastro. Tente novamente.');
                            restoreButton();
                        }
                    }, function(error) {
                        console.error('Erro ao fazer cadastro:', error);
                        alert('Erro de conexão. Tente novamente mais tarde.');
                        restoreButton();
                    });
                } else {
                    console.error("Botão de cadastro não encontrado");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                }
            });
        }
        
        // Configurar botões de alternância entre login e cadastro
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');
        
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', function() {
                const loginContainer = document.getElementById('loginContainer');
                const registerContainer = document.getElementById('registerContainer');
                
                if (loginContainer && registerContainer) {
                    loginContainer.classList.add('d-none');
                    registerContainer.classList.remove('d-none');
                }
            });
        }
        
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', function() {
                const loginContainer = document.getElementById('loginContainer');
                const registerContainer = document.getElementById('registerContainer');
                
                if (loginContainer && registerContainer) {
                    registerContainer.classList.add('d-none');
                    loginContainer.classList.remove('d-none');
                }
            });
        }
    } else {
        console.log("Não estamos na página de login");
        
        // Configurar botão de logout em outras páginas
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                auth.logout();
            });
        }
        
        // Verificar autenticação
        const userData = auth.checkAuth();
        if (!userData) return;
    }
});

// Função para fazer login
function login(cpf, password, successCallback, errorCallback) {
    const data = {
        action: 'login',
        cpf: cpf,
        password: password
    };
    
    // Usar XMLHttpRequest em vez de fetch para evitar problemas de CORS
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                successCallback(response.success, response.message, response);
            } catch (error) {
                errorCallback(error);
            }
        } else {
            errorCallback(new Error('Erro na requisição: ' + xhr.status));
        }
    };
    
    xhr.onerror = function() {
        errorCallback(new Error('Erro de conexão'));
    };
    
    xhr.send(JSON.stringify(data));
}

// Função para fazer cadastro
function register(name, cpf, phone, email, password, successCallback, errorCallback) {
    const data = {
        action: 'register',
        name: name,
        cpf: cpf,
        phone: phone,
        email: email,
        password: password,
        tipo: 'responsavel' // Por padrão, novos usuários são responsáveis
    };
    
    // Usar XMLHttpRequest em vez de fetch para evitar problemas de CORS
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                successCallback(response.success, response.message);
            } catch (error) {
                errorCallback(error);
            }
        } else {
            errorCallback(new Error('Erro na requisição: ' + xhr.status));
        }
    };
    
    xhr.onerror = function() {
        errorCallback(new Error('Erro de conexão'));
    };
    
    xhr.send(JSON.stringify(data));
}
