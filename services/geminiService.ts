
import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from '../types';

export const geminiService = {
  getSalesInsights: async (sales: Sale[], products: Product[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As an ERP Sales Analyst, analyze the following current state:
        - Total Products: ${products.length}
        - Total Sales Records: ${sales.length}
        - Low Stock Items: ${products.filter(p => p.stock_quantity <= p.low_stock_threshold).map(p => p.name).join(', ')}
        - Recent Sales: ${sales.slice(-5).map(s => `$${s.total_amount}`).join(', ')}

        Provide 3 actionable bullet points for the business owner in a friendly tone. 
        Focus on inventory optimization, cash flow, or sales trends. Keep it brief.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI Insights Error:", error);
      return "Unable to generate insights at this time. Please check your inventory levels and sales reports manually.";
    }
  }
};
