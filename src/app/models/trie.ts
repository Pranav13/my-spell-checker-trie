export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

export class Trie {
  private root: TrieNode = new TrieNode();

  // Insert a word into the Trie
  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
  }

  // Search for a word in the Trie
  search(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return node.isEndOfWord;
  }

  // Find all words starting with a given prefix
  startsWith(prefix: string): string[] {
    const results: string[] = [];
    let node = this.root;

    // Traverse the Trie to find the node representing the end of the prefix
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return results; // Prefix not found
      }
      node = node.children.get(char)!;
    }

    // Collect all words starting with the given prefix
    this.collectWords(node, prefix, results);
    return results;
  }

  // Collect all words from a given node
  private collectWords(node: TrieNode, prefix: string, results: string[]): void {
    if (node.isEndOfWord) {
      results.push(prefix);
    }
    for (const [char, childNode] of node.children.entries()) {
      this.collectWords(childNode, prefix + char, results);
    }
  }
}
