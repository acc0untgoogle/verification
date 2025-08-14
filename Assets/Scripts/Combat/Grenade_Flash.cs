using UnityEngine;

public class Grenade_Flash : Grenade {
    protected override void Explode(){ Debug.Log("FLASH! Apply blinding screen effect to nearby players (implement UI flash)."); }
}
