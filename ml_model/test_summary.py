#!/usr/bin/env python3
"""
Test script to demonstrate improved summary generation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_loader import generate_summary

def test_summary_levels():
    """Test summary generation with different levels"""
    
    # Sample legal text (similar to your example) - longer text to test better
    sample_text = """
    Devinder Singh @ Ladi had been arrested for the murder of his brother Khazan Singh three years ago. 
    He was released on interim bail from the Court and used to reside with his sister Saroj. 
    On 3.8.1990, he came to the house of his mother and his other brother Amar Singh also reached there and they had their meals together. 
    At about 10:10 PM, when they reached near the corner of Sukhdev Market, they heard Devinder Singh raising an alarm 'Bachao-B Bachao' and on turning back they saw that Amar and Shiv Charan were giving hockey blows and one Inder Singh was giving knife blows to Devinders. 
    When they tried to rescue their brother, all the above three accused persons brandished their knife and hockeys and warned that they will also kill him. 
    Thereafter all of them ran toward Bhisham Pitamah Marg, his brother became unconscious. 
    Many persons including Sujan Singh, S/o Ram Singh assembled there. 
    After sometime, PCR van came and progressively removed Devander Singh to AIIMS, where he was declared dead by the Doctor. 
    Inspector arrested the accused and recorded the disclosure statement of accused.
    The case was registered under Section 302 IPC and investigation was conducted by Inspector Richpal Singh.
    The accused persons were charged with murder and the case was committed to the Court of Sessions.
    During the trial, several witnesses were examined including Parminder Singh, Amar Singh, and other family members.
    The prosecution presented evidence including the weapon of offence, medical reports, and witness testimonies.
    The defense counsel argued that the prosecution had failed to establish the guilt of the accused beyond reasonable doubt.
    The court examined the evidence and found the accused guilty of the offence of murder.
    The accused were sentenced to life imprisonment for the murder of Devinder Singh @ Ladi.
    An appeal was filed in the High Court challenging the conviction and sentence.
    The High Court examined the evidence and upheld the conviction of the accused persons.
    The case is now pending before the Supreme Court for final disposal.
    """
    
    print("Testing Summary Generation Improvements")
    print("=" * 50)
    
    levels = ["short", "medium", "long", "very_long"]
    
    for level in levels:
        print(f"\n{level.upper()} SUMMARY:")
        print("-" * 30)
        try:
            summary = generate_summary(sample_text, level=level)
            print(f"Length: {len(summary)} characters")
            print(f"Summary: {summary}")
        except Exception as e:
            print(f"Error generating {level} summary: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_summary_levels()
