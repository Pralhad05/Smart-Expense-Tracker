package com.pralhad.expense.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "mysecretkeymysecretkeymysecretkeyRAMramRAMramRAM"; 
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key, SignatureAlgorithm.HS256) 
                .compact();
    }

    public String extractUsername(String token) {
        Claims claims = Jwts.parserBuilder()   
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }
}