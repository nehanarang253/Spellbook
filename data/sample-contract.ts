/**
 * Seeded sample contract so a reviewer sees the full workflow value in one click.
 *
 * This is a mutual NDA drafted from the *disclosing party's* perspective and
 * deliberately salted with terms a client-side lawyer should flag: an uncapped
 * indemnity, a perpetual confidentiality term, a one-sided governing-law clause,
 * and a missing mutual-termination right. Those hooks let Review, Ask, and Draft
 * each demonstrate real output against realistic language.
 */
export const SAMPLE_CONTRACT = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (this "Agreement") is entered into as of the Effective Date by and between Acme Robotics, Inc., a Delaware corporation ("Disclosing Party"), and the counterparty identified on the signature page ("Receiving Party").

1. Definition of Confidential Information.
"Confidential Information" means any and all information disclosed by either party to the other, whether orally, in writing, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. Confidential Information includes, without limitation, business plans, financial data, customer lists, product designs, and source code.

2. Obligations of Receiving Party.
The Receiving Party shall hold the Confidential Information in strict confidence and shall not disclose it to any third party without the prior written consent of the Disclosing Party. The Receiving Party shall protect the Confidential Information using at least the same degree of care it uses to protect its own confidential information, but in no event less than a reasonable degree of care.

3. Term.
The obligations of confidentiality under this Agreement shall survive in perpetuity and shall continue to bind the Receiving Party indefinitely, notwithstanding any return or destruction of the Confidential Information.

4. Indemnification.
The Receiving Party shall indemnify, defend, and hold harmless the Disclosing Party from and against any and all losses, damages, liabilities, costs, and expenses of any kind arising out of or relating to any breach of this Agreement by the Receiving Party. This indemnification obligation shall be unlimited in amount and shall not be subject to any cap on liability.

5. No License.
Nothing in this Agreement shall be construed as granting any rights to the Receiving Party, by license or otherwise, in or to any Confidential Information, except as expressly set forth herein.

6. Return of Materials.
Upon the written request of the Disclosing Party, the Receiving Party shall promptly return or destroy all materials containing Confidential Information and certify such destruction in writing.

7. Governing Law.
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware. The Receiving Party irrevocably consents to the exclusive jurisdiction of the state and federal courts located in Delaware for any dispute arising under this Agreement, and waives any objection to venue in such courts.

8. Injunctive Relief.
The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages would be inadequate, and agrees that the Disclosing Party shall be entitled to seek injunctive relief without the requirement of posting a bond.

9. Entire Agreement.
This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior or contemporaneous understandings, whether written or oral.
`;

export const SAMPLE_CONTRACT_TITLE = "Mutual NDA — Acme Robotics, Inc.";
