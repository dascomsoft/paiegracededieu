




import React from 'react'
import { formatCurrency, formatDate } from '../lib/format'
import '../Styles/ReceiptPreview.css'

export function ReceiptPreview({ receiptData, studentData, fees, onPrint, existingPayments, alreadyPaidAmounts }) {
  console.log('📄 ReceiptPreview - receiptData:', receiptData)
  console.log('📄 ReceiptPreview - studentData:', studentData)
  console.log('📄 ReceiptPreview - fees:', fees)
  console.log('📄 ReceiptPreview - existingPayments:', existingPayments)
  console.log('📄 ReceiptPreview - alreadyPaidAmounts:', alreadyPaidAmounts)

  if (!receiptData || !studentData) {
    return (
      <div className="receipt-container receipt-error">
        <div className="error-content">
          <p>Données manquantes pour l'impression du reçu</p>
          <p className="error-detail">receiptData: {receiptData ? 'présent' : 'absent'}</p>
          <p className="error-detail">studentData: {studentData ? 'présent' : 'absent'}</p>
        </div>
      </div>
    )
  }

  // CORRECTION : Calculer les montants totaux APRÈS le nouveau paiement
  const calculateTotalAfterPayment = () => {
    const total = {
      inscription: (alreadyPaidAmounts?.inscription || 0) + (receiptData.paidAmounts?.inscription || 0),
      pension_0: (alreadyPaidAmounts?.pension_0 || 0) + (receiptData.paidAmounts?.pension_0 || 0),
      pension_1: (alreadyPaidAmounts?.pension_1 || 0) + (receiptData.paidAmounts?.pension_1 || 0),
      pension_2: (alreadyPaidAmounts?.pension_2 || 0) + (receiptData.paidAmounts?.pension_2 || 0)
    };
    return total;
  };

  const totalAfterPayment = calculateTotalAfterPayment();

  // Calculer les totaux
  const totalDue = fees.inscription + fees.pension.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = Object.values(totalAfterPayment).reduce((sum, amount) => sum + amount, 0);
  const remaining = Math.max(0, totalDue - totalPaid);

  console.log('=== RECEIPT PREVIEW - CALCULS CORRIGÉS ===');
  console.log('💰 Anciens paiements (alreadyPaidAmounts):', alreadyPaidAmounts);
  console.log('💰 Nouveau paiement (receiptData.paidAmounts):', receiptData.paidAmounts);
  console.log('💰 Total après paiement (totalAfterPayment):', totalAfterPayment);
  console.log('🧮 Total dû:', totalDue);
  console.log('🧮 Total payé:', totalPaid);
  console.log('🧮 Reste à payer:', remaining);

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h1 className="header-title">RÉPUBLIQUE DU CAMEROUN</h1>
        <p className="header-subtitle">Ministère de l'Education de Base</p>
        <p className="header-detail">Délégation Régionale du Centre</p>
        <p className="header-detail">Délégation Départementale du Mfoundi</p>
      </div>

      <div className="receipt-title-section">
        <h2 className="school-title">GROUPE SCOLAIRE BILINGUE LA GRACE DE DIEU</h2>
        <h3 className="receipt-title">REÇU DE PAIEMENT</h3>
      </div>

      <div className="student-info-grid">
        <div className="student-info-left">
          <p className="student-name">{studentData.name}</p>
          <p className="amount-info">Montant payé: {formatCurrency(receiptData.totalPaid)}</p>
        </div>
        <div className="student-info-center">
          <p className="receipt-number">N° {receiptData.receiptNumber}</p>
          <p className="matricule-info">Matricule: {studentData.matricule}</p>
        </div>
        <div className="student-info-right">
          <p className="date-info">Date: {formatDate(receiptData.date)}</p>
          <p className="inscription-info">Inscription: {formatCurrency(fees.inscription)}</p>
        </div>
      </div>

      <div className="student-details">
        <p className="detail-item">
          Classe: <span className="detail-value">{studentData.class}</span> |
          Année scolaire: <span className="detail-value">{studentData.schoolYear}</span>
        </p>
        <p className="detail-item">
          Enregistré le {formatDate(receiptData.date)} à {new Date(receiptData.date).toLocaleTimeString('fr-FR')} |
          Opérateur: <span className="detail-value">{receiptData.operator || 'Administrateur'}</span>
        </p>
      </div>

      <div className="payment-details">
        <h4 className="payment-title">État actuel de paiement</h4>
        <p className='font-extrabold text-lg text-center'>Les montants versés ne sont ni remboursables, ni cessibles à des tiers.</p>

        <div className="table-container">
          <table className="payment-table">
            <thead className="table-header">
              <tr>
                <th className="table-head tariff-head">Tarifications</th>
                <th className="table-head amount-head">Montants</th>
                <th className="table-head paid-head">Déjà payés</th>
                <th className="table-head remaining-head">Reste</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {/* Ligne Inscription */}
              <tr className="table-row">
                <td className="table-cell tariff-cell">Inscription</td>
                <td className="table-cell amount-cell">{formatCurrency(fees.inscription)}</td>
                <td className="table-cell paid-cell">{formatCurrency(totalAfterPayment.inscription)}</td>
                <td className="table-cell remaining-cell">
                  {formatCurrency(Math.max(0, fees.inscription - totalAfterPayment.inscription))}
                </td>
              </tr>

              {/* Lignes des tranches */}
              {fees.pension.map((item, index) => {
                const pensionKey = `pension_${index}`;
                const alreadyPaid = totalAfterPayment[pensionKey] || 0;
                const remainingAmount = Math.max(0, item.amount - alreadyPaid);

                return (
                  <tr key={index} className="table-row">
                    <td className="table-cell tariff-cell">{item.tranche}</td>
                    <td className="table-cell amount-cell">{formatCurrency(item.amount)}</td>
                    <td className="table-cell paid-cell">{formatCurrency(alreadyPaid)}</td>
                    <td className="table-cell remaining-cell">{formatCurrency(remainingAmount)}</td>
                  </tr>
                )
              })}

              {/* Ligne des totaux */}
              <tr className="table-total-row">
                <td className="table-cell total-cell">Les Totaux</td>
                <td className="table-cell total-amount-cell">{formatCurrency(totalDue)}</td>
                <td className="table-cell total-paid-cell">{formatCurrency(totalPaid)}</td>
                <td className="table-cell total-remaining-cell">{formatCurrency(remaining)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section détaillant le nouveau paiement */}
      <div className="new-payment-details">
        <h4 className="new-payment-title">Détail du paiement actuel</h4>
        <div className="payment-breakdown">
          {receiptData.paidAmounts?.inscription > 0 && (
            <div className="payment-item">
              <span>Inscription:</span>
              <span>{formatCurrency(receiptData.paidAmounts.inscription)}</span>
            </div>
          )}
          {receiptData.paidAmounts?.pension_0 > 0 && (
            <div className="payment-item">
              <span>1ère Tranche:</span>
              <span>{formatCurrency(receiptData.paidAmounts.pension_0)}</span>
            </div>
          )}
          {receiptData.paidAmounts?.pension_1 > 0 && (
            <div className="payment-item">
              <span>2e Tranche:</span>
              <span>{formatCurrency(receiptData.paidAmounts.pension_1)}</span>
            </div>
          )}
          {receiptData.paidAmounts?.pension_2 > 0 && (
            <div className="payment-item">
              <span>3e Tranche:</span>
              <span>{formatCurrency(receiptData.paidAmounts.pension_2)}</span>
            </div>
          )}
          <div className="payment-total">
            <span>Total du paiement:</span>
            <span>{formatCurrency(receiptData.totalPaid)}</span>
          </div>
        </div>
      </div>

      <div className="receipt-footer">
        <p className='font-extrabold text-lg text-center'>Les montants versés ne sont ni remboursables, ni cessibles à des tiers.</p>
        <p>Téléphone: (+237)696-308-503 /WhatsApp : 651989899</p>
        <p>Siège social: YAOUNDÉ - Situee a AKOK-NDOE-2 (Au quartier Mbouda lieu dit face a la plaue mini marche)</p>
        <p>Arrêté d'ouverture: N° 61/JL/23/A/MINEDUB/SG/DSEPB/SDRA/ DR 05 JANVIER 2025</p>
        <p className="print-date">Imprimé le {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="print-actions">
        <button
          onClick={onPrint}
          className="print-button"
        >
          Imprimer le reçu
        </button>
      </div>
    </div>
  )
}