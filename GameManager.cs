using UnityEngine;

public enum GameMode { Deathmatch, SearchAndDestroy }

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;
    
    [Header("Game Settings")]
    public GameMode currentGameMode;
    public float matchTime = 600f;
    public int scoreToWin = 30;
    public bool isOnline = false;
    
    [Header("Teams")]
    public int terroristsScore;
    public int counterTerroristsScore;
    
    private float currentMatchTime;
    private bool isMatchEnded;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        currentMatchTime = matchTime;
        isMatchEnded = false;
    }
    
    private void Update()
    {
        if (isMatchEnded) return;
        
        currentMatchTime -= Time.deltaTime;
        
        if (currentMatchTime <= 0)
        {
            EndMatch("Time's up! Draw game.");
            return;
        }
        
        switch (currentGameMode)
        {
            case GameMode.Deathmatch:
                CheckDeathmatchWin();
                break;
            case GameMode.SearchAndDestroy:
                CheckSearchAndDestroyWin();
                break;
        }
    }
    
    private void CheckDeathmatchWin()
    {
        if (terroristsScore >= scoreToWin)
        EndMatch("Terrorists win!");
        else if (counterTerroristsScore >= scoreToWin)
            EndMatch("Counter-Terrorists win!");
    }
    
    private void CheckSearchAndDestroyWin()
    {
        // Logic for bomb planting/defusing
    }
    
    public void EndMatch(string message)
    {
        isMatchEnded = true;
        Debug.Log(message);
        // Show end match UI, etc.
    }
    
    public void AddScore(Team team, int points)
    {
        if (team == Team.Terrorist)
            terroristsScore += points;
        else
            counterTerroristsScore += points;
    }
}

public enum Team { Terrorist, CounterTerrorist }
