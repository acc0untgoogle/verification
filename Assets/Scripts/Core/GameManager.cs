using UnityEngine;

public class GameManager : MonoBehaviour {
    public static GameManager I; 
    [field: SerializeField] public TeamManager Teams { get; private set; }
    [field: SerializeField] public MonoBehaviour CurrentMode { get; private set; }

    void Awake(){ I = this; }
}
