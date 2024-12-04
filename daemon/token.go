// token.go
package main

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"math/rand"
)

// Generate random string of n symbols
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func RandStringBytesRmndr(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Int63()%int64(len(letterBytes))]
	}
	return string(b)
}

func main() {

	// Generate a hash from random string
	str := RandStringBytesRmndr(32)
	h := sha1.New()
	h.Write([]byte(str))
	sha1_hash := hex.EncodeToString(h.Sum(nil)) //Encodes the bytes to a "displayable" string

	fmt.Println(sha1_hash)

}
