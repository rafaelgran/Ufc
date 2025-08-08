// 🔐 IMPLEMENTAÇÃO DE AUTENTICAÇÃO BÁSICA
// Este script adiciona proteção ao admin

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Configuração de autenticação
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_this_password';

// Middleware de autenticação
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Middleware de log de auditoria
function auditLog(req, res, next) {
    const timestamp = new Date().toISOString();
    const ip = req.ip;
    const method = req.method;
    const path = req.path;
    const userAgent = req.get('User-Agent');
    
    console.log(`🔍 AUDIT: ${timestamp} | IP: ${ip} | ${method} ${path} | UA: ${userAgent}`);
    
    next();
}

// Configuração de sessão segura
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'change_this_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
};

// Rate limiting básico
const loginAttempts = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const attempts = loginAttempts.get(ip) || [];
    
    // Remover tentativas antigas (mais de 15 minutos)
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
    
    if (recentAttempts.length >= 5) {
        return false; // Muitas tentativas
    }
    
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);
    return true;
}

module.exports = {
    requireAuth,
    auditLog,
    sessionConfig,
    checkRateLimit,
    ADMIN_USERNAME,
    ADMIN_PASSWORD
}; 