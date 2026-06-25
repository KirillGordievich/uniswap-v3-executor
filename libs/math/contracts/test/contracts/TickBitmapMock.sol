// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/TickBitmap.sol';

/// @title Mock for inspecting tick bitmap functions
/// @notice Thin wrapper for library methods where all methods are public
contract TickBitmapMock {
    using TickBitmap for mapping(int16 => uint256);

    mapping(int16 => uint256) public bitmap;
    int24 public immutable spacing;

    /// @param _spacing Tick spacing to assume
    constructor(int24 _spacing) {
        spacing = _spacing;
    }

    /// @notice Obtain positions of a tick value in the tick bitmap
    /// @param tick Tick value
    /// @return wordPos Word that the tick belongs to
    /// @return bitPos Position of a tick in the word
    function pos(int24 tick) public view returns (int16 wordPos, uint8 bitPos) {
        require(tick % spacing == 0, 'tick does not conform to spacing');
        int24 compressed = tick / spacing;
        wordPos = int16(compressed >> 8);
        bitPos = uint8(compressed % 256);
    }

    /// @notice Check if a tick is set
    /// @param tick Tick value
    /// @return True if tick is set in the bitmap
    function get(int24 tick) public view returns (bool) {
        (int16 wordPos, uint8 bitPos) = pos(tick);
        return (bitmap[wordPos] & (1 << bitPos)) != 0;
    }

    /// @notice Set a tick value in the bitmap
    /// @param tick Tick value
    function set(int24 tick) public {
        (int16 wordPos, uint8 bitPos) = pos(tick);
        bitmap[wordPos] |= 1 << bitPos;
    }

    /// @notice Unset a tick value in the bitmap
    /// @param tick Tick value
    function unset(int24 tick) public {
        (int16 wordPos, uint8 bitPos) = pos(tick);
        bitmap[wordPos] &= ~(1 << bitPos);
    }

    /// @notice Find the next tick value for a swap step
    /// @param tick Current tick value
    /// @param zeroForOne True if token 0 is swapped for token 1 and false otherwise
    /// @return nextTick Value of the next tick
    /// @return initialized True if the next tick is initialized with liquidity and false otherwise
    function next(int24 tick, bool zeroForOne) public view returns (int24 nextTick, bool initialized) {
        (nextTick, initialized) = bitmap.nextInitializedTickWithinOneWord(tick, spacing, zeroForOne);
    }
}
