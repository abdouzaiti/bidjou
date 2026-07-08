/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Payment, Expense, Attendance, Session } from '../types';

/**
 * Generates an elegant printable window for a member QR Card.
 */
export function printMemberQRCard(member: Member) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(member.membershipNumber)}&color=1e40af`;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Carte Membre - ${member.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f1f5f9;
            margin: 0;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            box-sizing: border-box;
          }
          .card-container {
            width: 380px;
            height: 560px;
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border: 2px solid #e2e8f0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
            background-image: radial-gradient(circle at 100% 0%, rgba(30, 64, 175, 0.05) 0%, transparent 50%),
                              radial-gradient(circle at 0% 100%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
          }
          .header {
            background-color: #1e40af;
            color: #ffffff;
            padding: 24px;
            text-align: center;
            position: relative;
          }
          .header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .header p {
            margin: 4px 0 0 0;
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 1px;
          }
          .badge-gold {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #d4af37;
            color: #1e293b;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 16px;
            border-radius: 999px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
          .content {
            flex: 1;
            padding: 30px 24px 24px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .avatar-container {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            border: 3px solid #1e40af;
            padding: 3px;
            background: #ffffff;
            margin-bottom: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.05);
          }
          .avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: crop;
          }
          .name {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 4px 0;
          }
          .id-number {
            font-family: monospace;
            font-size: 13px;
            color: #1e40af;
            font-weight: 600;
            background-color: rgba(30, 64, 175, 0.08);
            padding: 4px 12px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .qr-box {
            width: 160px;
            height: 160px;
            padding: 10px;
            background: #ffffff;
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.02);
            margin-bottom: 20px;
          }
          .qr-img {
            width: 100%;
            height: 100%;
          }
          .footer {
            padding: 16px;
            border-top: 1px solid #e2e8f0;
            background-color: #f8fafc;
            display: flex;
            justify-content: space-around;
            font-size: 11px;
            color: #64748b;
          }
          .footer-item strong {
            color: #334155;
            display: block;
          }
          @media print {
            body {
              background-color: #ffffff;
              padding: 0;
            }
            .card-container {
              box-shadow: none;
              border: 1px solid #cbd5e1;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="card-container">
          <div class="header">
            <h2>Les Bijoux d'Oran</h2>
            <p>CLUB DE SPORT ET BIEN-ÊTRE</p>
            <div class="badge-gold">MEMBRE OFFICIEL</div>
          </div>
          <div class="content">
            <div class="avatar-container">
              <img class="avatar" src="${member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop'}" alt="${member.name}" />
            </div>
            <div class="name">${member.name}</div>
            <div class="id-number">${member.membershipNumber}</div>
            
            <div class="qr-box">
              <img class="qr-img" src="${qrUrl}" alt="QR Card" />
            </div>
          </div>
          <div class="footer">
            <div class="footer-item">
              <strong>Statut</strong>
              <span style="color: ${member.status === 'Active' ? '#10b981' : member.status === 'Suspended' ? '#f59e0b' : '#ef4444'}">${member.status}</span>
            </div>
            <div class="footer-item">
              <strong>Adhésion</strong>
              <span>${member.joinDate}</span>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generates an elegant printable invoice/receipt.
 */
export function printPaymentReceipt(payment: Payment, member: Member, currency: string = 'DZD') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Reçu de Paiement - ${payment.receiptNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            line-height: 1.5;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
          }
          .receipt-container {
            max-width: 650px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #1e40af;
            margin: 0;
          }
          .logo span {
            color: #d4af37;
          }
          .club-info {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .receipt-meta {
            font-size: 13px;
            color: #475569;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 30px;
          }
          .meta-box {
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
          }
          .meta-box h4 {
            margin: 0 0 8px 0;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .meta-box p {
            margin: 4px 0;
            font-size: 14px;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .receipt-table th {
            text-align: left;
            padding: 12px;
            background-color: #1e40af;
            color: #ffffff;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
          }
          .receipt-table th:first-child {
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
          }
          .receipt-table th:last-child {
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            text-align: right;
          }
          .receipt-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
          }
          .receipt-table td:last-child {
            text-align: right;
            font-weight: 600;
          }
          .total-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-bottom: 40px;
          }
          .total-row {
            display: flex;
            width: 250px;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .total-row.grand {
            border-top: 2px solid #e2e8f0;
            padding-top: 12px;
            font-size: 18px;
            font-weight: 700;
            color: #1e40af;
          }
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 50px;
            text-align: center;
            font-size: 13px;
          }
          .signature-line {
            border-top: 1px dashed #cbd5e1;
            margin-top: 50px;
            padding-top: 8px;
            color: #64748b;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 60px;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt-container {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div>
              <h1 class="logo">Les Bijoux d'Oran<span>.</span></h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Club de Sport d'Élite</p>
            </div>
            <div class="club-info">
              <p style="font-weight: 600; color: #1e293b; margin: 0 0 4px 0;">Les Bijoux d'Oran Inc.</p>
              <p style="margin: 2px 0;">Dojo Front de Mer, Oran</p>
              <p style="margin: 2px 0;">contact@lesbijouxoran.com</p>
              <p style="margin: 2px 0;">+213 (0) 550 12 34 56</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div>
              <h2 class="receipt-title">REÇU DE PAIEMENT</h2>
              <div class="receipt-meta">
                <strong>Référence :</strong> ${payment.receiptNumber}<br />
                <strong>Date d'émission :</strong> ${payment.date}
              </div>
            </div>
            <div style="background-color: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 700; padding: 6px 16px; border-radius: 999px; font-size: 13px;">
              RÉGLÉ
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <h4>Adhérent</h4>
              <p><strong>${member.name}</strong></p>
              <p>ID: ${member.membershipNumber}</p>
              <p>Tél: ${member.phone}</p>
            </div>
            <div class="meta-box">
              <h4>Détails de Paiement</h4>
              <p>Mode: <strong>${payment.paymentMethod}</strong></p>
              <p>Ref transaction: ${payment.reference || 'N/A'}</p>
              <p>Période: ${payment.month} ${payment.year}</p>
            </div>
          </div>

          <table class="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Abonnement Mensuel - ${payment.month} ${payment.year}</strong><br />
                  <span style="font-size: 12px; color: #64748b;">Accès illimité aux séances d'entraînement</span>
                </td>
                <td>${payment.amount.toLocaleString()} ${currency}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Sous-total :</span>
              <span>${payment.amount.toLocaleString()} ${currency}</span>
            </div>
            <div class="total-row">
              <span>Taxes (0%) :</span>
              <span>0,00 ${currency}</span>
            </div>
            <div class="total-row grand">
              <span>Total Réglé :</span>
              <span>${payment.amount.toLocaleString()} ${currency}</span>
            </div>
          </div>

          <div class="signature-section">
            <div>
              <div class="signature-line">Signature de l'adhérent</div>
            </div>
            <div>
              <div class="signature-line">Signature du trésorier</div>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre confiance et votre engagement au club Les Bijoux d'Oran !</p>
            <p style="font-size: 9px; margin-top: 8px;">Ce reçu est généré électroniquement et tient lieu de justificatif de paiement officiel.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generates an elegant printable financial/global report.
 */
export function printFinancialReport(payments: Payment[], expenses: Expense[], month: string, year: number, currency: string = 'DZD') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const paymentsRows = payments.map(p => `
    <tr>
      <td>${p.date}</td>
      <td><strong>${p.receiptNumber}</strong></td>
      <td>Cotisation ${p.month} ${p.year}</td>
      <td>${p.paymentMethod}</td>
      <td style="text-align: right; color: #10b981; font-weight: 600;">+${p.amount.toLocaleString()} ${currency}</td>
    </tr>
  `).join('');

  const expensesRows = expenses.map(e => `
    <tr>
      <td>${e.date}</td>
      <td><span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background-color: #f1f5f9; color: #475569;">${e.category}</span></td>
      <td>${e.title}</td>
      <td>Dépense</td>
      <td style="text-align: right; color: #ef4444; font-weight: 600;">-${e.amount.toLocaleString()} ${currency}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Rapport Financier - ${month} ${year}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            padding: 40px;
            background: #ffffff;
          }
          .header {
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title {
            margin: 0;
            color: #1e40af;
            font-size: 26px;
            font-weight: 800;
          }
          .subtitle {
            margin: 4px 0 0 0;
            color: #64748b;
            font-size: 14px;
          }
          .meta {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          .kpi-container {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
          }
          .kpi-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
          }
          .kpi-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .kpi-val {
            font-size: 22px;
            font-weight: 700;
          }
          .table-title {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin: 30px 0 15px 0;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 10px;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
          }
          td {
            padding: 12px 10px;
            font-size: 13px;
            border-bottom: 1px solid #f1f5f9;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Les Bijoux d'Oran</h1>
            <p class="subtitle">RAPPORT FINANCIER MENSUEL</p>
          </div>
          <div class="meta">
            <strong>Période :</strong> ${month} ${year}<br />
            <strong>Date du rapport :</strong> ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        <div class="kpi-container">
          <div class="kpi-card">
            <div class="kpi-label">Revenus (Cotisations)</div>
            <div class="kpi-val" style="color: #10b981;">+${totalIncome.toLocaleString()} ${currency}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Dépenses Club</div>
            <div class="kpi-val" style="color: #ef4444;">-${totalExpenses.toLocaleString()} ${currency}</div>
          </div>
          <div class="kpi-card" style="background-color: ${netIncome >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'};">
            <div class="kpi-label">Résultat Net</div>
            <div class="kpi-val" style="color: ${netIncome >= 0 ? '#10b981' : '#ef4444'};">${netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString()} ${currency}</div>
          </div>
        </div>

        <div class="table-title">Détail des Encaissements (Cotisations reçues)</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Référence</th>
              <th>Description</th>
              <th>Mode</th>
              <th style="text-align: right;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${paymentsRows || '<tr><td colspan="5" style="text-align: center; color: #64748b;">Aucune transaction enregistrée</td></tr>'}
          </tbody>
        </table>

        <div class="table-title">Détail des Décaissements (Dépenses réglées)</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Désignation</th>
              <th>Type</th>
              <th style="text-align: right;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${expensesRows || '<tr><td colspan="5" style="text-align: center; color: #64748b;">Aucune dépense enregistrée</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top: 60px; text-align: right; font-size: 13px; color: #64748b;">
          <p>Fait à Oran, le ${new Date().toLocaleDateString('fr-FR')}</p>
          <br /><br />
          <p style="font-weight: 600; color: #1e293b;">La Direction - Les Bijoux d'Oran</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
