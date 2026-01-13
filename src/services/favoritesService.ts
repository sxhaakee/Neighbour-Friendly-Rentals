import { supabase } from '../lib/supabase';

export interface Favorite {
  id: string;
  user_id: string;
  type: string;
  item_id: string;
  created_at: string;
}

class FavoritesService {
  async addFavorite(itemType: 'item' | 'property' | 'service', itemId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        type: itemType,
        item_id: itemId,
      });

    if (error) throw error;
  }

  async removeFavorite(itemType: 'item' | 'property' | 'service', itemId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('type', itemType)
      .eq('item_id', itemId);

    if (error) throw error;
  }

  async isFavorite(itemType: 'item' | 'property' | 'service', itemId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', itemType)
      .eq('item_id', itemId)
      .single();

    return !error && !!data;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFavoritesByType(userId: string, itemType: 'item' | 'property' | 'service'): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', userId)
      .eq('type', itemType);

    if (error) throw error;
    return data?.map(f => f.item_id) || [];
  }

  async toggleFavorite(itemType: 'item' | 'property' | 'service', itemId: string): Promise<boolean> {
    const isFav = await this.isFavorite(itemType, itemId);
    
    if (isFav) {
      await this.removeFavorite(itemType, itemId);
      return false;
    } else {
      await this.addFavorite(itemType, itemId);
      return true;
    }
  }
}

export const favoritesService = new FavoritesService();
