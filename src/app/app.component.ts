import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trie } from './models/trie';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  text: string = '';
  suggestions: string[] = [];
  lastWord: string = '';
  selectedIndex: number = -1;
  loading: boolean = false; // Define loading property

  private trie: Trie = new Trie();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true; // Set loading to true when starting to load data
    this.http.get('words.txt', { responseType: 'text' })
      .subscribe(data => {
        const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        words.forEach(word => this.trie.insert(word));
        this.loading = false; // Set loading to false after data is loaded
      });
  }

  onTextChanged(event: any): void {
    const contentEditableDiv = event.target;
    const text = contentEditableDiv.textContent?.trim() || '';
    this.text = text;
    
    const words = text.split(/\s+/);
    this.lastWord = words[words.length - 1];
    
    if (event.inputType === 'insertText' && event.data === ' ') {
      this.suggestions = [];
      return;
    }
    
    if (this.lastWord.length > 0) {
      if (this.trie.search(this.lastWord)) {
        this.suggestions = this.trie.startsWith(this.lastWord);
        this.toggleSuggestions(true);
      } else {
        this.suggestions = [`"${this.lastWord}" is not found in the dictionary.`];
        this.toggleSuggestions(true);
      }
    } else {
      this.toggleSuggestions(false);
    }
  }
  
  toggleSuggestions(show: boolean): void {
    const suggestionsDiv = document.querySelector('.suggestions');
    if (suggestionsDiv) {
      if (show) {
        suggestionsDiv.classList.add('show');
      } else {
        suggestionsDiv.classList.remove('show');
      }
    }
  }
  

  onKeyDown(event: KeyboardEvent): void {
    if (this.suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
        this.scrollToSelectedItem();
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
        this.scrollToSelectedItem();
        event.preventDefault();
      } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
        this.applySuggestion(this.suggestions[this.selectedIndex]);
        event.preventDefault();
      }
    }
  }

  applySuggestion(suggestion: string): void {
    const contentEditableDiv = document.getElementById('contentEditableDiv');
    if (contentEditableDiv) {
      const text = contentEditableDiv.textContent || '';
      const cursorPosition = this.getCaretPosition(contentEditableDiv);
  
      // Find the start of the last word
      const words = text.substring(0, cursorPosition).split(/\s+/);
      const lastWordStart = text.lastIndexOf(words[words.length - 1], cursorPosition - words[words.length - 1].length);
      
      // Replace the last word with the selected suggestion
      const updatedText = text.substring(0, lastWordStart) + suggestion + text.substring(cursorPosition);
      contentEditableDiv.textContent = updatedText;
      this.text = updatedText;
  
      // Restore cursor position after the inserted suggestion
      const newPosition = lastWordStart + suggestion.length;
      this.setCaretPosition(contentEditableDiv, newPosition);
  
      // Reset suggestions
      this.suggestions = [];
    }
  }
  
  setCaretPosition(element: HTMLElement, position: number): void {
    const range = document.createRange();
    const selection = window.getSelection();
    if (selection && element.childNodes.length > 0) {
      const textNode = element.childNodes[0] as Text;
      range.setStart(textNode, position);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  

  getCaretPosition(element: HTMLElement): number {
    let caretOffset = 0;
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  scrollToSelectedItem(): void {
    const suggestionList = document.querySelector('.suggestions ul');
    const selectedItem = suggestionList?.children[this.selectedIndex] as HTMLElement;

    if (selectedItem && suggestionList) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  
}
