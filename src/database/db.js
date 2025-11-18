


// const Database = require('better-sqlite3');
// const path = require('path');
// const fs = require('fs');

// class SchoolDB {
//   constructor() {
//     // Chemin vers la base de données dans le dossier utilisateur
//     const userDataPath = path.join(require('os').homedir(), '.gestion-scolarite');
    
//     // Créer le dossier s'il n'existe pas
//     if (!fs.existsSync(userDataPath)) {
//       fs.mkdirSync(userDataPath, { recursive: true });
//     }
    
//     this.dbPath = path.join(userDataPath, 'school.db');
//     this.init();
//   }

//   init() {
//     try {
//       this.db = new Database(this.dbPath);
//       this.db.pragma('journal_mode = WAL');
//       this.createTables();
//       this.seedData();
//       console.log('Base de données initialisée:', this.dbPath);
//     } catch (error) {
//       console.error('Erreur lors de l\'initialisation de la base de données:', error);
//       throw error;
//     }
//   }

//   createTables() {
//     // Table des opérateurs (utilisateurs)
//     this.db.prepare(`
//       CREATE TABLE IF NOT EXISTS operators (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         email TEXT UNIQUE NOT NULL,
//         password TEXT NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `).run();

//     // Table des élèves
//     this.db.prepare(`
//       CREATE TABLE IF NOT EXISTS students (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         class TEXT NOT NULL,
//         section TEXT NOT NULL,
//         school_year TEXT NOT NULL,
//         matricule TEXT UNIQUE,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `).run();

//     // Table des paiements
//     this.db.prepare(`
//       CREATE TABLE IF NOT EXISTS payments (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         student_id INTEGER NOT NULL,
//         student_name TEXT NOT NULL,
//         class_name TEXT NOT NULL,
//         section TEXT NOT NULL,
//         school_year TEXT NOT NULL,
//         paid_amounts TEXT NOT NULL,
//         total_paid INTEGER NOT NULL,
//         receipt_number TEXT UNIQUE NOT NULL,
//         operator TEXT NOT NULL,
//         date DATETIME DEFAULT CURRENT_TIMESTAMP,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
//       )
//     `).run();

//     // Table des reçus
//     this.db.prepare(`
//       CREATE TABLE IF NOT EXISTS receipts (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         payment_id INTEGER NOT NULL,
//         student_id INTEGER NOT NULL,
//         receipt_data TEXT NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE,
//         FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
//       )
//     `).run();

//     // Index pour améliorer les performances
//     this.db.prepare('CREATE INDEX IF NOT EXISTS idx_students_name ON students(name)').run();
//     this.db.prepare('CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id)').run();
//     this.db.prepare('CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date)').run();
//   }

//   seedData() {
//     // Vérifier si un opérateur admin existe déjà
//     const adminExists = this.db.prepare('SELECT COUNT(*) as count FROM operators WHERE email = ?')
//       .get('admin@ecole.com');
    
//     if (adminExists.count === 0) {
//       // Créer un opérateur admin par défaut
//       this.db.prepare(`
//         INSERT INTO operators (name, email, password) 
//         VALUES (?, ?, ?)
//       `).run('Administrateur', 'admin@ecole.com', 'admin123');
//       console.log('Opérateur admin créé');
//     }
//   }

//   // ===== MÉTHODES POUR LES OPÉRATEURS =====
//   createOperator(name, email, password) {
//     const stmt = this.db.prepare('INSERT INTO operators (name, email, password) VALUES (?, ?, ?)');
//     const result = stmt.run(name, email, password);
//     return { id: result.lastInsertRowid, name, email };
//   }

//   getOperatorByEmail(email) {
//     return this.db.prepare('SELECT * FROM operators WHERE email = ?').get(email);
//   }

//   // ===== MÉTHODES POUR LES ÉLÈVES =====
//   createStudent(name, class_, section, schoolYear, matricule) {
//     const stmt = this.db.prepare(`
//       INSERT INTO students (name, class, section, school_year, matricule)
//       VALUES (?, ?, ?, ?, ?)
//     `);
//     const result = stmt.run(name, class_, section, schoolYear, matricule);
//     return { 
//       id: result.lastInsertRowid, 
//       name, 
//       class: class_, 
//       section, 
//       schoolYear, 
//       matricule,
//       createdAt: new Date().toISOString()
//     };
//   }

//   getStudents() {
//     return this.db.prepare('SELECT * FROM students ORDER BY created_at DESC').all();
//   }

//   getStudent(id) {
//     return this.db.prepare('SELECT * FROM students WHERE id = ?').get(id);
//   }

//   updateStudent(id, name, class_, section, schoolYear) {
//     const stmt = this.db.prepare(`
//       UPDATE students 
//       SET name = ?, class = ?, section = ?, school_year = ?
//       WHERE id = ?
//     `);
//     const result = stmt.run(name, class_, section, schoolYear, id);
//     return result.changes > 0 ? { id, name, class: class_, section, schoolYear } : null;
//   }

//   deleteStudent(id) {
//     // Les paiements et reçus seront supprimés automatiquement grâce à CASCADE
//     const stmt = this.db.prepare('DELETE FROM students WHERE id = ?');
//     const result = stmt.run(id);
//     return result.changes > 0;
//   }

//   searchStudents(query) {
//     return this.db.prepare(`
//       SELECT * FROM students 
//       WHERE name LIKE ? OR matricule LIKE ? OR class LIKE ?
//       ORDER BY name
//     `).all(`%${query}%`, `%${query}%`, `%${query}%`);
//   }

//   // ===== MÉTHODES POUR LES PAIEMENTS =====
//   createPayment(studentId, studentName, className, section, schoolYear, paidAmounts, totalPaid, receiptNumber, operator) {
//     const stmt = this.db.prepare(`
//       INSERT INTO payments (student_id, student_name, class_name, section, school_year, paid_amounts, total_paid, receipt_number, operator)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `);
//     const paidAmountsStr = JSON.stringify(paidAmounts);
//     const result = stmt.run(studentId, studentName, className, section, schoolYear, paidAmountsStr, totalPaid, receiptNumber, operator);
    
//     return { 
//       id: result.lastInsertRowid,
//       studentId,
//       studentName,
//       className,
//       section,
//       schoolYear,
//       paidAmounts,
//       totalPaid,
//       receiptNumber,
//       operator,
//       date: new Date().toISOString(),
//       createdAt: new Date().toISOString()
//     };
//   }

//   getStudentPayments(studentId) {
//     const payments = this.db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC').all(studentId);
//     return payments.map(payment => ({
//       ...payment,
//       paidAmounts: JSON.parse(payment.paid_amounts)
//     }));
//   }

//   deletePayment(id) {
//     const stmt = this.db.prepare('DELETE FROM payments WHERE id = ?');
//     const result = stmt.run(id);
//     return result.changes > 0;
//   }

//   getAllPayments() {
//     const payments = this.db.prepare(`
//       SELECT p.*, s.matricule 
//       FROM payments p 
//       LEFT JOIN students s ON p.student_id = s.id 
//       ORDER BY p.date DESC
//     `).all();
    
//     return payments.map(payment => ({
//       ...payment,
//       paidAmounts: JSON.parse(payment.paid_amounts)
//     }));
//   }

//   // ===== MÉTHODES POUR LES REÇUS =====
//   generateReceipt(paymentId, studentId, receiptData) {
//     const stmt = this.db.prepare(`
//       INSERT INTO receipts (payment_id, student_id, receipt_data)
//       VALUES (?, ?, ?)
//     `);
//     const receiptDataStr = JSON.stringify(receiptData);
//     const result = stmt.run(paymentId, studentId, receiptDataStr);
//     return { 
//       id: result.lastInsertRowid, 
//       paymentId, 
//       studentId, 
//       receiptData 
//     };
//   }

//   getReceiptsByStudent(studentId) {
//     const receipts = this.db.prepare(`
//       SELECT r.*, p.receipt_number, p.date 
//       FROM receipts r 
//       JOIN payments p ON r.payment_id = p.id 
//       WHERE r.student_id = ? 
//       ORDER BY p.date DESC
//     `).all(studentId);
    
//     return receipts.map(receipt => ({
//       ...receipt,
//       receiptData: JSON.parse(receipt.receipt_data)
//     }));
//   }

//   // ===== STATISTIQUES =====
//   getStatistics() {
//     const totalStudents = this.db.prepare('SELECT COUNT(*) as count FROM students').get();
//     const totalPayments = this.db.prepare('SELECT COUNT(*) as count FROM payments').get();
//     const totalAmount = this.db.prepare('SELECT SUM(total_paid) as total FROM payments').get();
    
//     const paymentsByMonth = this.db.prepare(`
//       SELECT 
//         strftime('%Y-%m', date) as month,
//         COUNT(*) as payment_count,
//         SUM(total_paid) as total_amount
//       FROM payments 
//       GROUP BY strftime('%Y-%m', date)
//       ORDER BY month DESC
//       LIMIT 12
//     `).all();

//     return {
//       totalStudents: totalStudents.count,
//       totalPayments: totalPayments.count,
//       totalAmount: totalAmount.total || 0,
//       paymentsByMonth
//     };
//   }

//   // ===== SAUVEGARDE ET RESTAURATION =====
//   backupDatabase(backupPath) {
//     const backupDB = new Database(backupPath);
//     this.db.backup(backupDB)
//       .then(() => {
//         console.log('Sauvegarde réussie:', backupPath);
//       })
//       .catch((err) => {
//         console.error('Erreur de sauvegarde:', err);
//         throw err;
//       });
//   }

//   close() {
//     if (this.db) {
//       this.db.close();
//     }
//   }
// }

// module.exports = SchoolDB;





























const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class SchoolDB {
  constructor() {
    // Chemin vers la base de données dans le dossier utilisateur
    const userDataPath = path.join(require('os').homedir(), '.gestion-scolarite');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    this.dbPath = path.join(userDataPath, 'school.db');
    this.init();
  }

  init() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.createTables();
      this.seedData();
      console.log('Base de données initialisée:', this.dbPath);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  createTables() {
    // Table des opérateurs (utilisateurs)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS operators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Table des élèves
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        class TEXT NOT NULL,
        section TEXT NOT NULL,
        school_year TEXT NOT NULL,
        matricule TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Table des paiements
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        section TEXT NOT NULL,
        school_year TEXT NOT NULL,
        paid_amounts TEXT NOT NULL,
        total_paid INTEGER NOT NULL,
        receipt_number TEXT UNIQUE NOT NULL,
        operator TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
      )
    `).run();

    // Table des reçus
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        receipt_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
      )
    `).run();

    // Index
    this.db.prepare('CREATE INDEX IF NOT EXISTS idx_students_name ON students(name)').run();
    this.db.prepare('CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id)').run();
    this.db.prepare('CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date)').run();
  }

  seedData() {
    const adminExists = this.db.prepare('SELECT COUNT(*) as count FROM operators WHERE email = ?')
      .get('admin@ecole.com');
    
    if (adminExists.count === 0) {
      this.db.prepare(`
        INSERT INTO operators (name, email, password) 
        VALUES (?, ?, ?)
      `).run('Administrateur', 'admin@ecole.com', 'admin123');
      console.log('Opérateur admin créé');
    }
  }

  // ===== MÉTHODES POUR LES OPÉRATEURS =====
  createOperator(name, email, password) {
    const stmt = this.db.prepare('INSERT INTO operators (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, password);
    return { id: result.lastInsertRowid, name, email };
  }

  getOperatorByEmail(email) {
    return this.db.prepare('SELECT * FROM operators WHERE email = ?').get(email);
  }

  // ===== MÉTHODES POUR LES ÉLÈVES =====
  createStudent(name, class_, section, schoolYear, matricule) {
    // Générer automatiquement l’année scolaire si non fournie
    const currentYear = new Date().getFullYear();
    const year = schoolYear || `${currentYear}-${currentYear + 1}`;

    const stmt = this.db.prepare(`
      INSERT INTO students (name, class, section, school_year, matricule)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, class_, section, year, matricule);
    return { 
      id: result.lastInsertRowid, 
      name, 
      class: class_, 
      section, 
      schoolYear: year, 
      matricule,
      createdAt: new Date().toISOString()
    };
  }

  getStudents() {
    return this.db.prepare('SELECT * FROM students ORDER BY created_at DESC').all();
  }

  getStudent(id) {
    return this.db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  }

  updateStudent(id, name, class_, section, schoolYear) {
    const stmt = this.db.prepare(`
      UPDATE students 
      SET name = ?, class = ?, section = ?, school_year = ?
      WHERE id = ?
    `);
    const result = stmt.run(name, class_, section, schoolYear, id);
    return result.changes > 0 ? { id, name, class: class_, section, schoolYear } : null;
  }

  deleteStudent(id) {
    const stmt = this.db.prepare('DELETE FROM students WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  searchStudents(query) {
    return this.db.prepare(`
      SELECT * FROM students 
      WHERE name LIKE ? OR matricule LIKE ? OR class LIKE ?
      ORDER BY name
    `).all(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  // ===== MÉTHODES POUR LES PAIEMENTS =====
  createPayment(studentId, studentName, className, section, schoolYear, paidAmounts, totalPaid, receiptNumber, operator) {
    // Générer automatiquement l’année scolaire si non fournie
    const currentYear = new Date().getFullYear();
    const year = schoolYear || `${currentYear}-${currentYear + 1}`;

    const stmt = this.db.prepare(`
      INSERT INTO payments (student_id, student_name, class_name, section, school_year, paid_amounts, total_paid, receipt_number, operator)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const paidAmountsStr = JSON.stringify(paidAmounts);
    const result = stmt.run(studentId, studentName, className, section, year, paidAmountsStr, totalPaid, receiptNumber, operator);
    
    return { 
      id: result.lastInsertRowid,
      studentId,
      studentName,
      className,
      section,
      schoolYear: year,
      paidAmounts,
      totalPaid,
      receiptNumber,
      operator,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }

  getStudentPayments(studentId) {
    const payments = this.db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC').all(studentId);
    return payments.map(payment => ({
      ...payment,
      paidAmounts: JSON.parse(payment.paid_amounts)
    }));
  }

  deletePayment(id) {
    const stmt = this.db.prepare('DELETE FROM payments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getAllPayments() {
    const payments = this.db.prepare(`
      SELECT p.*, s.matricule 
      FROM payments p 
      LEFT JOIN students s ON p.student_id = s.id 
      ORDER BY p.date DESC
    `).all();
    
    return payments.map(payment => ({
      ...payment,
      paidAmounts: JSON.parse(payment.paid_amounts)
    }));
  }

  // ===== MÉTHODES POUR LES REÇUS =====
  generateReceipt(paymentId, studentId, receiptData) {
    const stmt = this.db.prepare(`
      INSERT INTO receipts (payment_id, student_id, receipt_data)
      VALUES (?, ?, ?)
    `);
    const receiptDataStr = JSON.stringify(receiptData);
    const result = stmt.run(paymentId, studentId, receiptDataStr);
    return { 
      id: result.lastInsertRowid, 
      paymentId, 
      studentId, 
      receiptData 
    };
  }

  getReceiptsByStudent(studentId) {
    const receipts = this.db.prepare(`
      SELECT r.*, p.receipt_number, p.date 
      FROM receipts r 
      JOIN payments p ON r.payment_id = p.id 
      WHERE r.student_id = ? 
      ORDER BY p.date DESC
    `).all(studentId);
    
    return receipts.map(receipt => ({
      ...receipt,
      receiptData: JSON.parse(receipt.receipt_data)
    }));
  }

  // ===== STATISTIQUES =====
  getStatistics() {
    const totalStudents = this.db.prepare('SELECT COUNT(*) as count FROM students').get();
    const totalPayments = this.db.prepare('SELECT COUNT(*) as count FROM payments').get();
    const totalAmount = this.db.prepare('SELECT SUM(total_paid) as total FROM payments').get();
    
    const paymentsByMonth = this.db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COUNT(*) as payment_count,
        SUM(total_paid) as total_amount
      FROM payments 
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    return {
      totalStudents: totalStudents.count,
      totalPayments: totalPayments.count,
      totalAmount: totalAmount.total || 0,
      paymentsByMonth
    };
  }

  // ===== SAUVEGARDE =====
  backupDatabase(backupPath) {
    const backupDB = new Database(backupPath);
    this.db.backup(backupDB)
      .then(() => {
        console.log('Sauvegarde réussie:', backupPath);
      })
      .catch((err) => {
        console.error('Erreur de sauvegarde:', err);
        throw err;
      });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = SchoolDB;

























