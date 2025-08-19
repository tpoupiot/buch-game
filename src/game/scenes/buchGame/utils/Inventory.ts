export type InventoryItemMeta = Record<string, unknown>;

export interface InventoryItem {
    id: string;
    name?: string;
    quantity: number;
    meta?: InventoryItemMeta;
}

/**
 * Inventaire avec persistance dans sessionStorage.
 * - Conçu pour être simple et robuste côté client.
 * - Les éléments sont indexés par `id` et agrégés par `quantity`.
 * - Les données sont chiffrées dans le sessionStorage.
 */
export class Inventory {
    private readonly storageKey: string;
    private readonly encryptionKey: string = "buch_inventory_key";
    private itemsById: Map<string, InventoryItem> = new Map();

    constructor(storageKey: string = "buch.inventory") {
        this.storageKey = storageKey;
        this.loadFromStorage();
    }

    addItem(
        item: Omit<InventoryItem, "quantity"> & { quantity?: number },
        quantity?: number
    ): void {
        const delta = quantity ?? item.quantity ?? 1;
        if (!item.id) throw new Error("addItem: 'id' requis");
        if (delta <= 0) return;

        const existing = this.itemsById.get(item.id);
        if (existing) {
            existing.quantity += delta;
            // Mettre à jour les champs non quantitatifs si fournis
            if (item.name !== undefined) existing.name = item.name;
            if (item.meta !== undefined) existing.meta = item.meta;
        } else {
            this.itemsById.set(item.id, {
                id: item.id,
                name: item.name,
                quantity: delta,
                meta: item.meta,
            });
        }

        this.saveToStorage();
    }

    removeItem(id: string, quantity: number = 1): void {
        if (!id) return;
        if (quantity <= 0) return;

        const existing = this.itemsById.get(id);
        if (!existing) return;

        existing.quantity -= quantity;
        if (existing.quantity <= 0) {
            this.itemsById.delete(id);
        }

        this.saveToStorage();
    }

    deleteItem(id: string): void {
        if (!id) return;
        if (this.itemsById.delete(id)) {
            this.saveToStorage();
        }
    }

    setQuantity(id: string, quantity: number): void {
        if (!id) return;
        if (quantity <= 0) {
            this.itemsById.delete(id);
            this.saveToStorage();
            return;
        }

        const existing = this.itemsById.get(id);
        if (existing) {
            existing.quantity = quantity;
        } else {
            this.itemsById.set(id, { id, quantity });
        }
        this.saveToStorage();
    }

    getItem(id: string): InventoryItem | undefined {
        const v = this.itemsById.get(id);
        return v
            ? { ...v, meta: v.meta ? { ...v.meta } : undefined }
            : undefined;
    }

    getAll(): InventoryItem[] {
        return Array.from(this.itemsById.values()).map((v) => ({
            ...v,
            meta: v.meta ? { ...v.meta } : undefined,
        }));
    }

    getUniqueItemCount(): number {
        return this.itemsById.size;
    }

    getTotalQuantity(): number {
        let total = 0;
        this.itemsById.forEach((v) => (total += v.quantity));
        return total;
    }

    clear(): void {
        this.itemsById.clear();
        this.saveToStorage();
    }

    private encrypt(data: string): string {
        // Simple XOR encryption
        let encrypted = "";
        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(
                data.charCodeAt(i) ^
                    this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            );
        }
        return btoa(encrypted); // Encode en base64
    }

    private decrypt(data: string): string {
        // Simple XOR decryption
        const encrypted = atob(data); // Decode base64
        let decrypted = "";
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(
                encrypted.charCodeAt(i) ^
                    this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            );
        }
        return decrypted;
    }

    private loadFromStorage(): void {
        if (!this.canUseSessionStorage()) return;
        try {
            const raw = window.sessionStorage.getItem(this.storageKey);
            if (!raw) return;
            const decrypted = this.decrypt(raw);
            const parsed = JSON.parse(decrypted) as InventoryItem[] | unknown;
            if (!Array.isArray(parsed)) return;
            this.itemsById.clear();
            for (const it of parsed) {
                if (!it || typeof it !== "object") continue;
                const cast = it as Partial<InventoryItem>;
                if (!cast.id || typeof cast.id !== "string") continue;
                const qty =
                    typeof cast.quantity === "number" ? cast.quantity : 0;
                if (qty <= 0) continue;
                this.itemsById.set(cast.id, {
                    id: cast.id,
                    name: cast.name,
                    quantity: qty,
                    meta: cast.meta,
                });
            }
        } catch {
            // Ignore corrupted storage
        }
    }

    private saveToStorage(): void {
        if (!this.canUseSessionStorage()) return;
        try {
            const data = JSON.stringify(this.getAll());
            const encrypted = this.encrypt(data);
            window.sessionStorage.setItem(this.storageKey, encrypted);
        } catch {
            // Quota errors or serialization issues are ignored intentionally
        }
    }

    private canUseSessionStorage(): boolean {
        try {
            if (typeof window === "undefined") return false;
            if (!("sessionStorage" in window)) return false;
            // Smoke test (may throw on some browsers/privacy modes)
            const k = `__inv_test_${this.storageKey}`;
            window.sessionStorage.setItem(k, "1");
            window.sessionStorage.removeItem(k);
            return true;
        } catch {
            return false;
        }
    }
}

export default Inventory;
