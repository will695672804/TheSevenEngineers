const API_BASE_URL = 'http://localhost:3001/api';

// Configuration axios-like pour les requêtes
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), // Ne pas définir Content-Type pour FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.status === 204 ? {} as T : await response.json(); // Gérer les réponses sans contenu
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{token: string, user: any}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request<{token: string, user: any}>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.request<{user: any}>('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Courses endpoints
  async getCourses(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{courses: any[]}>(`/courses${queryString}`);
  }

  async getCourse(id: string) {
    return this.request<{course: any}>(`/courses/${id}`);
  }

  async enrollInCourse(courseId: string) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  async completeLesson(courseId: string, lessonId: string) {
    return this.request(`/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  }

  async createCourse(data: FormData) {
    return this.request('/courses', {
      method: 'POST',
      body: data,
    });
  }

  async updateCourse(id: string, data: FormData) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Products endpoints
  async getProducts(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{products: any[]}>(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request<{product: any}>(`/products/${id}`);
  }

  async createProduct(data: FormData) {
    return this.request('/products', {
      method: 'POST',
      body: data,
    });
  }

  async updateProduct(id: string, data: FormData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart endpoints
  async getCart() {
    return this.request<{items: any[], total: number, itemCount: number}>('/cart');
  }

  async addToCart(itemId: string, itemType: 'course' | 'product', quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType, quantity }),
    });
  }

  async updateCartItem(itemId: string, itemType: 'course' | 'product', quantity: number) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ itemId, itemType, quantity }),
    });
  }

  async removeFromCart(itemId: string, itemType: 'course' | 'product') {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ itemId, itemType }),
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async createOrder(paymentMethod: string, shippingAddress?: string) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, shippingAddress }),
    });
  }

  async getMyOrders() {
    return this.request<{orders: any[]}>('/orders/my-orders');
  }

  async getOrder(id: string) {
    return this.request<{order: any}>(`/orders/${id}`);
  }

  // Messages endpoints
  async getMessages() {
    return this.request<{messages: any[]}>('/messages');
  }

  async sendMessage(content: string) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  async getUnreadCount() {
    return this.request<{unreadCount: number}>('/messages/unread-count');
  }

  // Admin endpoints
  async getAllOrders(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{orders: any[]}>(`/orders${queryString}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getUsers(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{users: any[], pagination: any}>(`/users${queryString}`);
  }

  async getUser(id: string) {
    return this.request<{user: any}>(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllMessages() {
    return this.request<{messages: any[]}>('/messages/all');
  }

  async getConversations() {
    return this.request<{conversations: any[]}>('/messages/conversations');
  }

  async sendMessageToUser(userId: string, content: string) {
    return this.request('/messages/send-to-user', {
      method: 'POST',
      body: JSON.stringify({ userId, content }),
    });
  }

  async getUserStats() {
    return this.request('/users/stats/overview');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;